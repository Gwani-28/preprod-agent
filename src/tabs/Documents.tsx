import { useRef, useState } from 'react'
import { AppState, DocumentSections, MeetingLog } from '../types'
import { Card } from '../components/ui/Card'
import { Field, TextArea, TextInput } from '../components/ui/Field'
import { suggestAgenda } from '../lib/agendaSuggest'
import {
  MEETING_CATEGORY_LABEL,
  MEETING_DEPARTMENTS,
  groupedMeetingItems,
  makeMeetingLog,
} from '../lib/meetingLogs'

interface Props {
  state: AppState
  setDocs: (d: DocumentSections) => void
  setMeetingLogs: (logs: MeetingLog[]) => void
}

const SECTIONS: {
  key: keyof DocumentSections
  label: string
  hint?: string
  rows?: number
}[] = [
  { key: 'intention', label: '기획의도', hint: '왜 이 프로젝트를 만드는가.', rows: 5 },
  { key: 'directing', label: '연출 방향', rows: 5 },
  { key: 'toneAndManner', label: '톤앤매너', rows: 4 },
  {
    key: 'references',
    label: '레퍼런스 설명',
    hint: '작품 / 광고 / 뮤비 / 이미지에서 가져오는 지점.',
    rows: 4,
  },
  {
    key: 'storyboard',
    label: '시나리오 / 콘티',
    hint: '주요 장면 흐름, 컷 구성, continuity 메모.',
    rows: 6,
  },
  { key: 'productionPlan', label: '제작 방향', rows: 4 },
  { key: 'shootingStrategy', label: '촬영 전략', rows: 4 },
  {
    key: 'castingStyling',
    label: '캐스팅 / 스타일링',
    hint: '모델, 배우, 아티스트, 헤어/메이크업 방향.',
    rows: 4,
  },
  { key: 'artCostume', label: '미술 / 의상 방향', rows: 4 },
  { key: 'locationNote', label: '로케이션 설명', rows: 4 },
  {
    key: 'propsEquipment',
    label: '소품 / 장비',
    hint: '주요 소품, 장비 패키지, 특수 준비물.',
    rows: 4,
  },
  {
    key: 'schedulePlan',
    label: '촬영 운영표',
    hint: '일차, 시간대, 우천/대체 플랜.',
    rows: 5,
  },
  {
    key: 'riskMemo',
    label: '리스크 메모',
    hint: '문제 가능성과 대응 시나리오.',
    rows: 4,
  },
  {
    key: 'meetingAgenda',
    label: '회의 안건',
    hint: '항목별 1줄. 회의에서 다룰 순서대로.',
    rows: 8,
  },
]

export function Documents({ state, setDocs, setMeetingLogs }: Props) {
  const docs = state.documents
  const meetingFileRef = useRef<HTMLInputElement>(null)
  const [meetingTitle, setMeetingTitle] = useState('')
  const [meetingDepartment, setMeetingDepartment] = useState('전체')
  const [meetingDraft, setMeetingDraft] = useState('')
  const meetingGroups = groupedMeetingItems(state.meetingLogs)

  const handleSuggestAgenda = () => {
    const draft = suggestAgenda(state)
    const existing = docs.meetingAgenda.trim()
    const merged = existing ? `${draft}\n\n---\n\n${existing}` : draft
    setDocs({ ...docs, meetingAgenda: merged })
  }

  const addMeetingLog = ({
    rawText,
    title,
    sourceName,
  }: {
    rawText: string
    title: string
    sourceName: string
  }) => {
    if (!rawText.trim()) return
    const log = makeMeetingLog({
      title,
      department: meetingDepartment,
      sourceName,
      rawText,
    })
    setMeetingLogs([log, ...state.meetingLogs])
  }

  const handleMeetingFile = async (files?: FileList | null) => {
    const nextFiles = Array.from(files ?? [])
    if (nextFiles.length === 0) return
    const logs: MeetingLog[] = []
    for (const file of nextFiles) {
      const text = await file.text()
      if (!text.trim()) continue
      logs.push(
        makeMeetingLog({
          title: meetingTitle || file.name.replace(/\.[^.]+$/, ''),
          department: meetingDepartment,
          sourceName: file.name,
          rawText: text,
        }),
      )
    }
    if (logs.length > 0) setMeetingLogs([...logs, ...state.meetingLogs])
  }

  const removeMeetingLog = (id: string) => {
    if (!confirm('이 회의록 색인을 삭제할까요?')) return
    setMeetingLogs(state.meetingLogs.filter((log) => log.id !== id))
  }

  return (
    <div className="space-y-4">
      <Card
        title="회의록 색인"
        description="부서별 회의록을 여러 번 올리면 결정사항, 액션, 미정/확인, 리스크, 참고로 자동 분류합니다."
        actions={
          <>
            <button
              type="button"
              onClick={() => meetingFileRef.current?.click()}
              className="min-h-9 whitespace-nowrap rounded border border-ink-700 px-2.5 py-1 text-xs text-ink-200 hover:bg-ink-700"
            >
              txt/md 올리기
            </button>
            <input
              ref={meetingFileRef}
              type="file"
              accept=".txt,.md,text/plain,text/markdown"
              multiple
              className="hidden"
              onChange={async (e) => {
                try {
                  await handleMeetingFile(e.target.files)
                } finally {
                  e.target.value = ''
                }
              }}
            />
          </>
        }
      >
        <div className="grid gap-3 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="회의 제목">
                <TextInput
                  value={meetingTitle}
                  onChange={(e) => setMeetingTitle(e.target.value)}
                  placeholder="예: 연출 1차 회의"
                />
              </Field>
              <Field label="부서 / 출처">
                <select
                  value={meetingDepartment}
                  onChange={(e) => setMeetingDepartment(e.target.value)}
                  className="min-h-11 w-full rounded border px-3 py-2 text-base sm:text-sm"
                >
                  {MEETING_DEPARTMENTS.map((department) => (
                    <option key={department} value={department}>
                      {department}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="빠른 붙여넣기">
              <TextArea
                rows={7}
                value={meetingDraft}
                onChange={(e) => setMeetingDraft(e.target.value)}
                placeholder="회의록을 붙여넣고 색인 버튼을 누릅니다."
              />
            </Field>
            <button
              type="button"
              onClick={() => {
                addMeetingLog({
                  rawText: meetingDraft,
                  title: meetingTitle || '붙여넣은 회의록',
                  sourceName: 'paste',
                })
                setMeetingDraft('')
              }}
              className="min-h-10 whitespace-nowrap rounded border border-ink-300 bg-ink-100 px-3 py-1.5 text-xs font-semibold text-ink-900 hover:bg-white"
            >
              붙여넣은 내용 색인
            </button>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {Object.entries(MEETING_CATEGORY_LABEL).map(([key, label]) => {
                const count = state.meetingLogs.reduce(
                  (sum, log) => sum + log.items.filter((item) => item.category === key).length,
                  0,
                )
                return (
                  <div key={key} className="rounded border border-ink-700 px-3 py-2">
                    <div className="whitespace-nowrap text-[11px] text-ink-400">{label}</div>
                    <div className="text-lg font-semibold tabular-nums text-ink-100">{count}</div>
                  </div>
                )
              })}
            </div>
            {state.meetingLogs.length === 0 ? (
              <p className="rounded border border-dashed border-ink-700 px-3 py-6 text-center text-sm text-ink-400">
                아직 색인된 회의록이 없습니다.
              </p>
            ) : (
              <div className="max-h-[28rem] space-y-2 overflow-auto pr-1">
                {state.meetingLogs.map((log) => (
                  <article key={log.id} className="rounded border border-ink-700 px-3 py-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-ink-100">{log.title}</div>
                        <div className="mt-0.5 text-[11px] text-ink-500">
                          {log.department} · {new Date(log.createdAt).toLocaleString('ko-KR')}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeMeetingLog(log.id)}
                        className="shrink-0 whitespace-nowrap text-xs text-ink-400 underline-offset-4 hover:underline"
                      >
                        삭제
                      </button>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {Object.entries(MEETING_CATEGORY_LABEL).map(([key, label]) => {
                        const count = log.items.filter((item) => item.category === key).length
                        if (count === 0) return null
                        return (
                          <span
                            key={key}
                            className="rounded border border-ink-700 px-1.5 py-0.5 text-[10px] text-ink-300"
                          >
                            {label} {count}
                          </span>
                        )
                      })}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>

        {meetingGroups.length > 0 && (
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            {meetingGroups.map((group) => (
              <div key={group.category} className="rounded border border-ink-700 px-3 py-2">
                <h3 className="text-sm font-semibold text-ink-100">{group.label}</h3>
                <ul className="mt-2 space-y-1 text-xs text-ink-300">
                  {group.items.slice(0, 6).map((item) => (
                    <li key={`${item.log.id}-${item.id}`} className="leading-relaxed">
                      <span className="text-ink-500">[{item.log.department}]</span> {item.text}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
      {SECTIONS.map((s) => (
        <Card
          key={s.key}
          title={s.label}
          description={s.hint}
          actions={
            s.key === 'meetingAgenda' ? (
              <button
                onClick={handleSuggestAgenda}
                className="min-h-9 whitespace-nowrap rounded border border-ink-300 bg-ink-100 px-2.5 py-1 text-xs font-semibold text-ink-900 hover:bg-white"
                title="누락/위험 항목과 회의록 키워드 메모를 안건 초안으로 추가합니다."
              >
                자동 안건 초안 추가
              </button>
            ) : undefined
          }
        >
          <TextArea
            rows={s.rows ?? 4}
            value={docs[s.key]}
            onChange={(e) => setDocs({ ...docs, [s.key]: e.target.value })}
            placeholder="여기에 작성합니다…"
          />
        </Card>
      ))}
      </div>
    </div>
  )
}
