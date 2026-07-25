import { ReactNode, SelectHTMLAttributes, useMemo, useState } from 'react'
import {
  ShootingDay,
  ShootingInfoItem,
  ShootingInfoType,
  ShootingScene,
  ShootingTimelineItem,
  ShootingTimelineType,
} from '../types'
import { Card } from '../components/ui/Card'
import { Field, TextArea, TextInput } from '../components/ui/Field'
import { downloadCallSheetImage } from '../lib/callSheetImage'
import {
  SHOOTING_TIMELINE_TYPES,
  formatTimelineTime,
  sortTimelineItems,
} from '../lib/shooting'

interface Props {
  days: ShootingDay[]
  setDays: (days: ShootingDay[]) => void
  projectTitle?: string
}

const INFO_TYPES: { key: ShootingInfoType; label: string }[] = [
  { key: 'staff', label: '스태프' },
  { key: 'cast', label: '배우' },
  { key: 'location', label: '촬영지' },
  { key: 'meal', label: '식대' },
  { key: 'notice', label: '공지' },
]

const SOL_OPTIONS = ['', 'S', 'O', 'L']
const DAY_NIGHT_OPTIONS = ['', 'D', 'N']
const IN_OUT_OPTIONS = ['', 'I', 'O']

const TIMELINE_PRESETS: {
  type: ShootingTimelineType
  content: string
  startTime?: string
  endTime?: string
}[] = [
  { type: 'call', content: '스태프 콜 / 장비 하차' },
  { type: 'hmu', content: '배우 도착 / 헤어메이크업' },
  { type: 'rehearsal', content: '동선 리허설' },
  { type: 'shoot', content: '촬영' },
  { type: 'meal', content: '식사' },
  { type: 'wrap', content: '데이터 백업 / 철수' },
]

const DEFAULT_TIMELINE_TEMPLATE = [
  { type: 'call', startTime: '08:00', content: '스태프 콜 / 장비 하차' },
  { type: 'setup', startTime: '08:30', content: '카메라·조명 세팅' },
  { type: 'hmu', startTime: '09:00', content: '배우 도착 / 헤어메이크업' },
  { type: 'rehearsal', startTime: '10:00', content: '동선 리허설' },
  { type: 'shoot', startTime: '10:30', content: '촬영 시작' },
  { type: 'meal', startTime: '13:00', content: '식사' },
  { type: 'shoot', startTime: '14:00', content: '촬영 재개' },
  { type: 'wrap', startTime: '18:00', content: '데이터 백업 / 철수' },
] satisfies Partial<ShootingTimelineItem>[]

export function ShootingPlan({ days, setDays, projectTitle = '' }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(days[0]?.id ?? null)
  const selected = useMemo(
    () => days.find((day) => day.id === selectedId) ?? days[0],
    [days, selectedId],
  )

  const addDay = () => {
    const next = createDay(days.length + 1)
    setDays([...days, next])
    setSelectedId(next.id)
  }

  const updateDay = (patch: Partial<ShootingDay>) => {
    if (!selected) return
    setDays(days.map((day) => (day.id === selected.id ? { ...day, ...patch } : day)))
  }

  const removeDay = () => {
    if (!selected) return
    if (!confirm('이 회차 일촬표를 삭제할까요?')) return
    const next = days.filter((day) => day.id !== selected.id)
    setDays(next)
    setSelectedId(next[0]?.id ?? null)
  }

  const updateScene = (id: string, patch: Partial<ShootingScene>) => {
    if (!selected) return
    updateDay({
      scenes: selected.scenes.map((scene) => (scene.id === id ? { ...scene, ...patch } : scene)),
    })
  }

  const updateTimeline = (id: string, patch: Partial<ShootingTimelineItem>) => {
    if (!selected) return
    updateDay({
      timeline: selected.timeline.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    })
  }

  const updateInfo = (id: string, patch: Partial<ShootingInfoItem>) => {
    if (!selected) return
    updateDay({
      info: selected.info.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    })
  }

  const addTimelineItem = (patch: Partial<ShootingTimelineItem> = {}) => {
    if (!selected) return
    updateDay({
      timeline: [...selected.timeline, createTimelineItem(patch)],
    })
  }

  const addTimelineTemplate = () => {
    if (!selected) return
    updateDay({
      timeline: [
        ...selected.timeline,
        ...DEFAULT_TIMELINE_TEMPLATE.map((item) => createTimelineItem(item)),
      ],
    })
  }

  const sortTimeline = () => {
    if (!selected) return
    updateDay({ timeline: sortTimelineItems(selected.timeline) })
  }

  return (
    <div className="space-y-4">
      <Card
        title="일일촬영 계획표"
        description="회차별 콜시트, 씬별 촬영표, 시간표, 스태프/배우/장소/식대 정보를 관리합니다."
        actions={
          <div className="flex flex-wrap gap-2">
            {selected && (
              <button
                type="button"
                onClick={() => downloadCallSheetImage(selected, projectTitle)}
                className="min-h-10 whitespace-nowrap rounded border border-ink-700 px-3 py-1.5 text-xs font-semibold text-ink-200 hover:bg-ink-700"
              >
                이미지 저장
              </button>
            )}
            <button
              type="button"
              onClick={addDay}
              className="min-h-10 whitespace-nowrap rounded border border-ink-300 bg-ink-100 px-3 py-1.5 text-xs font-semibold text-ink-900 hover:bg-white"
            >
              회차 추가
            </button>
          </div>
        }
      >
        {days.length === 0 ? (
          <div className="rounded border border-dashed border-ink-700 px-4 py-10 text-center">
            <p className="text-sm font-medium text-ink-200">아직 일촬표가 없습니다.</p>
            <p className="mt-1 text-xs text-ink-500">
              회차 추가를 누르면 DAY, 씬표, 타임테이블, 현장 정보를 작성할 수 있습니다.
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {days.map((day) => (
              <button
                key={day.id}
                type="button"
                onClick={() => setSelectedId(day.id)}
                className={`min-h-10 rounded border px-3 py-1.5 text-xs font-semibold ${
                  selected?.id === day.id
                    ? 'border-ink-100 bg-ink-100 text-ink-900'
                    : 'border-ink-700 text-ink-200 hover:bg-ink-700'
                }`}
              >
                {day.title || '회차'}
              </button>
            ))}
          </div>
        )}
      </Card>

      {selected && (
        <>
          <Card
            title="회차 개요"
            description="첨부 일촬표의 상단 헤더 영역입니다."
            actions={
              <button
                type="button"
                onClick={removeDay}
                className="min-h-9 whitespace-nowrap rounded border border-ink-700 px-2.5 py-1 text-xs text-ink-300 hover:bg-ink-700"
              >
                회차 삭제
              </button>
            }
          >
            <div className="grid gap-3 md:grid-cols-3">
              <Field label="회차명">
                <TextInput
                  value={selected.title}
                  onChange={(e) => updateDay({ title: e.target.value })}
                  placeholder="DAY 1"
                />
              </Field>
              <Field label="촬영일">
                <TextInput
                  type="date"
                  value={selected.date}
                  onChange={(e) => updateDay({ date: e.target.value })}
                />
              </Field>
              <Field label="예상날씨">
                <TextInput
                  value={selected.weather}
                  onChange={(e) => updateDay({ weather: e.target.value })}
                  placeholder="맑음 / 흐림 / 우천"
                />
              </Field>
              <Field label="최저온도">
                <TextInput
                  value={selected.lowTemp}
                  onChange={(e) => updateDay({ lowTemp: e.target.value })}
                  placeholder="24도"
                />
              </Field>
              <Field label="최고온도">
                <TextInput
                  value={selected.highTemp}
                  onChange={(e) => updateDay({ highTemp: e.target.value })}
                  placeholder="31도"
                />
              </Field>
              <Field label="강수확률">
                <TextInput
                  value={selected.rainChance}
                  onChange={(e) => updateDay({ rainChance: e.target.value })}
                  placeholder="10%"
                />
              </Field>
              <Field label="일출">
                <TextInput
                  type="time"
                  value={selected.sunrise}
                  onChange={(e) => updateDay({ sunrise: e.target.value })}
                />
              </Field>
              <Field label="일몰">
                <TextInput
                  type="time"
                  value={selected.sunset}
                  onChange={(e) => updateDay({ sunset: e.target.value })}
                />
              </Field>
              <Field label="집합 / 콜타임">
                <TextInput
                  value={selected.callTime}
                  onChange={(e) => updateDay({ callTime: e.target.value })}
                  placeholder="스태프 14:00 / 배우 15:30"
                />
              </Field>
              <Field label="촬영 종료 / 복귀">
                <TextInput
                  value={selected.wrapTime}
                  onChange={(e) => updateDay({ wrapTime: e.target.value })}
                  placeholder="00:00 / 01:00"
                />
              </Field>
              <div className="md:col-span-2">
                <Field label="베이스 / 집합 장소">
                  <TextInput
                    value={selected.basecamp}
                    onChange={(e) => updateDay({ basecamp: e.target.value })}
                    placeholder="학교 / 로케이션 / 렌탈샵 주소"
                  />
                </Field>
              </div>
              <div className="md:col-span-3">
                <Field label="공지 / 오늘의 한마디">
                  <TextArea
                    rows={3}
                    value={selected.notes}
                    onChange={(e) => updateDay({ notes: e.target.value })}
                    placeholder="현장 주의사항, 복장, 준비물, 메시지"
                  />
                </Field>
              </div>
            </div>
          </Card>

          <CallSheetTable
            title="씬별 촬영표"
            description="S#, 장소, 낮/밤, 실내/외, 촬영 시간, 컷 수, 내용, 등장인물입니다."
            onAdd={() =>
              updateDay({
                scenes: [...selected.scenes, createScene()],
              })
            }
          >
            {selected.scenes.length === 0 ? (
              <EmptyLine text="씬 항목이 없습니다." />
            ) : (
              <div className="space-y-3">
                {selected.scenes.map((scene) => (
                  <div key={scene.id} className="rounded border border-ink-700 p-3">
                    <div className="grid gap-2 md:grid-cols-6">
                      <MiniField label="S#">
                        <TextInput
                          value={scene.sceneNo}
                          onChange={(e) => updateScene(scene.id, { sceneNo: e.target.value })}
                          placeholder="8"
                        />
                      </MiniField>
                      <MiniField label="촬영 장소" className="md:col-span-2">
                        <TextInput
                          value={scene.location}
                          onChange={(e) => updateScene(scene.id, { location: e.target.value })}
                          placeholder="양평 호숫가"
                        />
                      </MiniField>
                      <MiniField label="촬영 시간" className="md:col-span-2">
                        <TextInput
                          value={scene.time}
                          onChange={(e) => updateScene(scene.id, { time: e.target.value })}
                          placeholder="17:00 - 19:00"
                        />
                      </MiniField>
                      <MiniField label="컷 수">
                        <TextInput
                          type="number"
                          min={0}
                          value={scene.cutCount || ''}
                          onChange={(e) =>
                            updateScene(scene.id, { cutCount: Number(e.target.value) || 0 })
                          }
                          placeholder="5"
                        />
                      </MiniField>
                      <MiniField label="S/O/L">
                        <SelectInput
                          value={scene.sol}
                          onChange={(e) => updateScene(scene.id, { sol: e.target.value })}
                        >
                          {SOL_OPTIONS.map((option) => (
                            <option key={option || 'blank'} value={option}>
                              {option || '-'}
                            </option>
                          ))}
                        </SelectInput>
                      </MiniField>
                      <MiniField label="D/N">
                        <SelectInput
                          value={scene.dayNight}
                          onChange={(e) => updateScene(scene.id, { dayNight: e.target.value })}
                        >
                          {DAY_NIGHT_OPTIONS.map((option) => (
                            <option key={option || 'blank'} value={option}>
                              {option || '-'}
                            </option>
                          ))}
                        </SelectInput>
                      </MiniField>
                      <MiniField label="I/O">
                        <SelectInput
                          value={scene.inOut}
                          onChange={(e) => updateScene(scene.id, { inOut: e.target.value })}
                        >
                          {IN_OUT_OPTIONS.map((option) => (
                            <option key={option || 'blank'} value={option}>
                              {option || '-'}
                            </option>
                          ))}
                        </SelectInput>
                      </MiniField>
                      <MiniField label="등장인물" className="md:col-span-3">
                        <TextInput
                          value={scene.cast}
                          onChange={(e) => updateScene(scene.id, { cast: e.target.value })}
                          placeholder="주연 A, 주연 B"
                        />
                      </MiniField>
                      <MiniField label="내용" className="md:col-span-5">
                        <TextInput
                          value={scene.description}
                          onChange={(e) => updateScene(scene.id, { description: e.target.value })}
                          placeholder="장면 내용"
                        />
                      </MiniField>
                      <button
                        type="button"
                        onClick={() =>
                          updateDay({
                            scenes: selected.scenes.filter((item) => item.id !== scene.id),
                          })
                        }
                        className="min-h-11 rounded border border-ink-700 px-3 text-xs text-ink-300 hover:bg-ink-700"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CallSheetTable>

          <CallSheetTable
            title="Time Table"
            description="시작/종료 시간, 구분, 내용, 비고를 입력합니다."
            onAdd={() => addTimelineItem()}
          >
            <div className="mb-3 space-y-2 rounded border border-ink-700 bg-ink-900/30 p-3">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={addTimelineTemplate}
                  className="min-h-9 rounded border border-ink-700 px-2.5 py-1 text-xs text-ink-200 hover:bg-ink-700"
                >
                  기본 시간표
                </button>
                <button
                  type="button"
                  onClick={sortTimeline}
                  className="min-h-9 rounded border border-ink-700 px-2.5 py-1 text-xs text-ink-200 hover:bg-ink-700"
                >
                  시간순 정렬
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {TIMELINE_PRESETS.map((preset) => (
                  <button
                    key={`${preset.type}-${preset.content}`}
                    type="button"
                    onClick={() => addTimelineItem(preset)}
                    className="min-h-8 rounded border border-ink-700 px-2.5 py-1 text-[11px] text-ink-300 hover:bg-ink-700"
                  >
                    {preset.content}
                  </button>
                ))}
              </div>
            </div>

            {selected.timeline.length === 0 ? (
              <EmptyLine text="시간표 항목이 없습니다." />
            ) : (
              <div className="space-y-2">
                {selected.timeline.map((item) => (
                  <div key={item.id} className="rounded border border-ink-700 p-3">
                    <div className="grid gap-2 md:grid-cols-[8rem_8rem_8rem_1fr_auto]">
                      <MiniField label="시작">
                        <TextInput
                          type="time"
                          value={item.startTime}
                          onChange={(e) =>
                            updateTimeline(item.id, {
                              startTime: e.target.value,
                              time: formatTimelineTime({ ...item, startTime: e.target.value }),
                            })
                          }
                        />
                      </MiniField>
                      <MiniField label="종료">
                        <TextInput
                          type="time"
                          value={item.endTime}
                          onChange={(e) =>
                            updateTimeline(item.id, {
                              endTime: e.target.value,
                              time: formatTimelineTime({ ...item, endTime: e.target.value }),
                            })
                          }
                        />
                      </MiniField>
                      <MiniField label="구분">
                        <SelectInput
                          value={item.type}
                          onChange={(e) =>
                            updateTimeline(item.id, {
                              type: e.target.value as ShootingTimelineType,
                            })
                          }
                        >
                          {SHOOTING_TIMELINE_TYPES.map((type) => (
                            <option key={type.key} value={type.key}>
                              {type.label}
                            </option>
                          ))}
                        </SelectInput>
                      </MiniField>
                      <MiniField label="내용">
                        <TextInput
                          value={item.content}
                          onChange={(e) => updateTimeline(item.id, { content: e.target.value })}
                          placeholder="S#8 촬영 / 식사 / 철수"
                        />
                      </MiniField>
                      <button
                        type="button"
                        onClick={() =>
                          updateDay({
                            timeline: selected.timeline.filter((entry) => entry.id !== item.id),
                          })
                        }
                        className="min-h-11 self-end rounded border border-ink-700 px-3 text-xs text-ink-300 hover:bg-ink-700"
                      >
                        삭제
                      </button>
                      <MiniField label="비고" className="md:col-span-5">
                        <TextInput
                          value={item.note}
                          onChange={(e) => updateTimeline(item.id, { note: e.target.value })}
                          placeholder="담당자, 장소, 준비물"
                        />
                      </MiniField>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CallSheetTable>

          <CallSheetTable
            title="현장 정보"
            description="스태프, 배우, 촬영지, 식대, 공지를 한 곳에 모읍니다."
            onAdd={() =>
              updateDay({
                info: [...selected.info, createInfoItem()],
              })
            }
          >
            {selected.info.length === 0 ? (
              <EmptyLine text="현장 정보 항목이 없습니다." />
            ) : (
              <div className="space-y-2">
                {selected.info.map((item) => (
                  <div key={item.id} className="grid gap-2 rounded border border-ink-700 p-3 md:grid-cols-[8rem_1fr_1fr_1fr_auto]">
                    <MiniField label="구분">
                      <SelectInput
                        value={item.type}
                        onChange={(e) =>
                          updateInfo(item.id, { type: e.target.value as ShootingInfoType })
                        }
                      >
                        {INFO_TYPES.map((type) => (
                          <option key={type.key} value={type.key}>
                            {type.label}
                          </option>
                        ))}
                      </SelectInput>
                    </MiniField>
                    <MiniField label="역할 / 장소 / 구분">
                      <TextInput
                        value={item.label}
                        onChange={(e) => updateInfo(item.id, { label: e.target.value })}
                        placeholder="촬영감독 / 저녁 / 베이스"
                      />
                    </MiniField>
                    <MiniField label="이름 / 주소 / 업체">
                      <TextInput
                        value={item.name}
                        onChange={(e) => updateInfo(item.id, { name: e.target.value })}
                        placeholder="이름 / 주소 / 업체"
                      />
                    </MiniField>
                    <MiniField label="연락처 / 시간">
                      <TextInput
                        value={item.contact}
                        onChange={(e) => updateInfo(item.id, { contact: e.target.value })}
                        placeholder="010-0000-0000"
                      />
                    </MiniField>
                    <button
                      type="button"
                      onClick={() =>
                        updateDay({
                          info: selected.info.filter((entry) => entry.id !== item.id),
                        })
                      }
                      className="min-h-11 rounded border border-ink-700 px-3 text-xs text-ink-300 hover:bg-ink-700"
                    >
                      삭제
                    </button>
                    <MiniField label="비고" className="md:col-span-5">
                      <TextInput
                        value={item.note}
                        onChange={(e) => updateInfo(item.id, { note: e.target.value })}
                        placeholder="주의사항 / 준비물"
                      />
                    </MiniField>
                  </div>
                ))}
              </div>
            )}
          </CallSheetTable>
        </>
      )}
    </div>
  )
}

function CallSheetTable({
  title,
  description,
  onAdd,
  children,
}: {
  title: string
  description: string
  onAdd: () => void
  children: ReactNode
}) {
  return (
    <Card
      title={title}
      description={description}
      actions={
        <button
          type="button"
          onClick={onAdd}
          className="min-h-9 whitespace-nowrap rounded border border-ink-700 px-2.5 py-1 text-xs text-ink-200 hover:bg-ink-700"
        >
          항목 추가
        </button>
      }
    >
      {children}
    </Card>
  )
}

function EmptyLine({ text }: { text: string }) {
  return <p className="text-sm text-ink-500">{text}</p>
}

function MiniField({
  label,
  className = '',
  children,
}: {
  label: string
  className?: string
  children: ReactNode
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-[11px] font-medium text-ink-500">{label}</span>
      {children}
    </label>
  )
}

function SelectInput(props: SelectHTMLAttributes<HTMLSelectElement>) {
  const { className = '', ...rest } = props
  return (
    <select
      {...rest}
      className={`min-h-11 w-full rounded border px-3 py-2 text-base sm:text-sm ${className}`}
    />
  )
}

function createDay(index: number): ShootingDay {
  return {
    id: makeId('shoot-day'),
    title: `DAY ${index}`,
    date: '',
    weather: '',
    lowTemp: '',
    highTemp: '',
    rainChance: '',
    sunrise: '',
    sunset: '',
    callTime: '',
    wrapTime: '',
    basecamp: '',
    notes: '',
    scenes: [],
    timeline: [],
    info: [],
  }
}

function createScene(): ShootingScene {
  return {
    id: makeId('scene'),
    sceneNo: '',
    location: '',
    sol: '',
    dayNight: '',
    inOut: '',
    time: '',
    cutCount: 0,
    description: '',
    cast: '',
  }
}

function createTimelineItem(patch: Partial<ShootingTimelineItem> = {}): ShootingTimelineItem {
  const startTime = patch.startTime ?? ''
  const endTime = patch.endTime ?? ''
  const time =
    patch.time ??
    (startTime || endTime
      ? formatTimelineTime({
          id: '',
          startTime,
          endTime,
          type: patch.type ?? 'etc',
          content: patch.content ?? '',
          note: patch.note ?? '',
          time: '',
        })
      : '')
  return {
    id: makeId('timeline'),
    time,
    startTime,
    endTime,
    type: patch.type ?? 'etc',
    content: patch.content ?? '',
    note: patch.note ?? '',
  }
}

function createInfoItem(): ShootingInfoItem {
  return {
    id: makeId('shoot-info'),
    type: 'staff',
    label: '',
    name: '',
    contact: '',
    note: '',
  }
}

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}
