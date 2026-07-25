import { useState } from 'react'
import {
  AppState,
  CATEGORIES,
  ChecklistCategory,
  ChecklistItem,
  ChecklistStatus,
  STATUSES,
  STATUS_LABEL,
} from '../types'
import { Card } from '../components/ui/Card'
import { ProgressBar } from '../components/ui/ProgressBar'
import { statsByCategory } from '../lib/progress'

interface Props {
  state: AppState
  setChecklist: (items: ChecklistItem[]) => void
}

const newId = () =>
  `item-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`

export function Checklist({ state, setChecklist }: Props) {
  const byCat = statsByCategory(state.checklist)
  const [openCat, setOpenCat] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(CATEGORIES.map((c) => [c, true])),
  )

  const update = (id: string, patch: Partial<ChecklistItem>) =>
    setChecklist(state.checklist.map((i) => (i.id === id ? { ...i, ...patch } : i)))

  const remove = (id: string) =>
    setChecklist(state.checklist.filter((i) => i.id !== id))

  const add = (category: ChecklistCategory) => {
    const next: ChecklistItem = {
      id: newId(),
      category,
      title: '',
      status: 'todo',
      note: '',
    }
    setChecklist([...state.checklist, next])
  }

  return (
    <div className="space-y-3">
      {CATEGORIES.map((cat) => {
        const items = state.checklist.filter((i) => i.category === cat)
        const stats = byCat[cat]
        const isOpen = openCat[cat] ?? true
        return (
          <Card
            key={cat}
            title={
              <button
                onClick={() => setOpenCat({ ...openCat, [cat]: !isOpen })}
                className="flex min-h-8 items-center gap-2 text-left"
              >
                <span className="text-ink-400">{isOpen ? '▾' : '▸'}</span>
                <span>{cat}</span>
                <span className="text-xs font-normal text-ink-400">
                  {stats.done}/{stats.total} · {stats.percent}%
                </span>
              </button>
            }
            actions={
              <>
                <div className="hidden w-28 sm:block">
                  <ProgressBar
                    percent={stats.percent}
                    tone={stats.risk > 0 ? 'risk' : 'neutral'}
                  />
                </div>
                <button
                  onClick={() => add(cat)}
                  className="min-h-9 rounded border border-ink-700 px-3 py-1 text-xs text-ink-200 hover:bg-ink-700"
                >
                  + 추가
                </button>
              </>
            }
          >
            {!isOpen ? null : items.length === 0 ? (
              <p className="text-sm text-ink-400">항목이 없습니다.</p>
            ) : (
              <ul className="space-y-2 sm:divide-y sm:divide-ink-700 sm:space-y-0">
                {items.map((it) => (
                  <li
                    key={it.id}
                    className="grid grid-cols-12 items-center gap-2 rounded-md border border-ink-700 bg-ink-900/30 p-2 sm:rounded-none sm:border-0 sm:bg-transparent sm:px-0"
                  >
                    <div className="col-span-12 sm:col-span-5">
                      <input
                        value={it.title}
                        onChange={(e) => update(it.id, { title: e.target.value })}
                        placeholder="항목명"
                        className="min-h-11 w-full rounded border px-3 py-2 text-base sm:min-h-9 sm:text-sm"
                      />
                    </div>
                    <div className="col-span-5 sm:col-span-2">
                      <select
                        value={it.status}
                        onChange={(e) =>
                          update(it.id, { status: e.target.value as ChecklistStatus })
                        }
                        className="min-h-11 w-full rounded border px-2 py-2 text-base sm:min-h-9 sm:text-sm"
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {STATUS_LABEL[s]}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-6 sm:col-span-4">
                      <input
                        value={it.note}
                        onChange={(e) => update(it.id, { note: e.target.value })}
                        placeholder="메모"
                        className="min-h-11 w-full rounded border px-3 py-2 text-base sm:min-h-9 sm:text-sm"
                      />
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <button
                        onClick={() => remove(it.id)}
                        className="flex min-h-11 min-w-9 items-center justify-center rounded text-xs text-ink-400 hover:bg-ink-700 hover:text-red-300 sm:min-h-9"
                        title="삭제"
                        aria-label={`${it.title || '체크리스트 항목'} 삭제`}
                      >
                        ✕
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        )
      })}
    </div>
  )
}
