import { CrewMember } from '../types'
import { Card } from '../components/ui/Card'
import { Field, TextArea, TextInput } from '../components/ui/Field'

interface Props {
  crew: CrewMember[]
  setCrew: (crew: CrewMember[]) => void
}

const ROLE_PRESETS = [
  '연출',
  '프로듀서',
  '조연출',
  '촬영감독',
  '조명',
  '동시녹음',
  '미술/의상',
  '헤어/메이크업',
  '제작부',
  '편집/후반',
]

export function Crew({ crew, setCrew }: Props) {
  const addMember = (role = '') => {
    setCrew([
      ...crew,
      {
        id: makeId(),
        role,
        name: '',
        contact: '',
        note: '',
      },
    ])
  }

  const updateMember = (id: string, patch: Partial<CrewMember>) => {
    setCrew(crew.map((member) => (member.id === id ? { ...member, ...patch } : member)))
  }

  const removeMember = (id: string) => {
    if (!confirm('이 스태프 항목을 삭제할까요?')) return
    setCrew(crew.filter((member) => member.id !== id))
  }

  return (
    <div className="space-y-4">
      <Card
        title="스태프 리스트"
        description="PPM 앞쪽에 들어가는 역할, 이름, 연락처, 확정 메모입니다."
        actions={
          <button
            type="button"
            onClick={() => addMember()}
            className="min-h-10 rounded border border-ink-300 bg-ink-100 px-3 py-1.5 text-xs font-semibold text-ink-900 hover:bg-white"
          >
            스태프 추가
          </button>
        }
      >
        <div className="flex flex-wrap gap-2">
          {ROLE_PRESETS.map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => addMember(role)}
              className="min-h-9 rounded border border-ink-700 px-2.5 py-1 text-xs text-ink-200 hover:bg-ink-700"
            >
              {role}
            </button>
          ))}
        </div>
      </Card>

      {crew.length === 0 ? (
        <div className="rounded-lg border border-dashed border-ink-700 px-4 py-10 text-center">
          <p className="text-sm font-medium text-ink-200">아직 스태프 항목이 없습니다.</p>
          <p className="mt-1 text-xs text-ink-500">
            연출, 프로듀서, 촬영, 조명, 사운드부터 넣어두면 PPM 표지가 더 단단해집니다.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {crew.map((member, index) => (
            <article
              key={member.id}
              className="rounded-lg border border-ink-700 bg-ink-800/60 p-3 sm:p-4"
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="text-xs text-ink-500">#{index + 1}</div>
                <button
                  type="button"
                  onClick={() => removeMember(member.id)}
                  className="min-h-9 rounded border border-ink-700 px-2.5 text-xs text-ink-300 hover:bg-ink-700"
                >
                  삭제
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="역할">
                  <TextInput
                    value={member.role}
                    onChange={(e) => updateMember(member.id, { role: e.target.value })}
                    placeholder="예: 촬영감독"
                  />
                </Field>
                <Field label="이름 / 업체">
                  <TextInput
                    value={member.name}
                    onChange={(e) => updateMember(member.id, { name: e.target.value })}
                    placeholder="이름 또는 섭외 상태"
                  />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="연락처">
                    <TextInput
                      value={member.contact}
                      onChange={(e) => updateMember(member.id, { contact: e.target.value })}
                      placeholder="전화, 메일, 카카오톡 등"
                    />
                  </Field>
                </div>
                <div className="sm:col-span-2">
                  <Field label="메모">
                    <TextArea
                      rows={3}
                      value={member.note}
                      onChange={(e) => updateMember(member.id, { note: e.target.value })}
                      placeholder="확정 여부, 담당 범위, 견적 상태"
                    />
                  </Field>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

function makeId() {
  return `crew-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}
