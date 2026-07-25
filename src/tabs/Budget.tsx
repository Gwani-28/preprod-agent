import { useState } from 'react'
import {
  AppState,
  BUDGET_CATEGORIES,
  BudgetCategory,
  BudgetItem,
} from '../types'
import { Card } from '../components/ui/Card'
import { formatKRW, totalByCategory, totalOf } from '../lib/budget'

interface Props {
  state: AppState
  setBudget: (items: BudgetItem[]) => void
}

const newId = () =>
  `budget-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`

export function Budget({ state, setBudget }: Props) {
  const total = totalOf(state.budget)
  const byCat = totalByCategory(state.budget)
  const [openCat, setOpenCat] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(BUDGET_CATEGORIES.map((c) => [c, true])),
  )

  const update = (id: string, patch: Partial<BudgetItem>) =>
    setBudget(state.budget.map((b) => (b.id === id ? { ...b, ...patch } : b)))
  const remove = (id: string) => setBudget(state.budget.filter((b) => b.id !== id))
  const add = (category: BudgetCategory) => {
    const next: BudgetItem = {
      id: newId(),
      category,
      item: '',
      planned: 0,
      note: '',
    }
    setBudget([...state.budget, next])
  }

  return (
    <div className="space-y-4">
      <Card title="예산 합계" description={`${state.budget.length}개 항목`}>
        <div className="flex flex-wrap items-baseline gap-4">
          <div>
            <div className="text-[11px] uppercase tracking-wide text-ink-400">총 예산</div>
            <div className="mt-1 text-3xl font-bold tabular-nums text-ink-100">
              {formatKRW(total)}
            </div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">
          {BUDGET_CATEGORIES.map((cat) => (
            <CatBar key={cat} cat={cat} value={byCat[cat]} total={total} />
          ))}
        </div>
      </Card>

      {BUDGET_CATEGORIES.map((cat) => {
        const items = state.budget.filter((b) => b.category === cat)
        const sum = byCat[cat]
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
                  {items.length}개 · {formatKRW(sum)}
                </span>
              </button>
            }
            actions={
              <button
                onClick={() => add(cat)}
                className="min-h-9 rounded border border-ink-700 px-3 py-1 text-xs text-ink-200 hover:bg-ink-700"
              >
                + 추가
              </button>
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
                        value={it.item}
                        onChange={(e) => update(it.id, { item: e.target.value })}
                        placeholder="항목명"
                        className="min-h-11 w-full rounded border px-3 py-2 text-base sm:min-h-9 sm:text-sm"
                      />
                    </div>
                    <div className="col-span-6 sm:col-span-2">
                      <input
                        type="number"
                        min={0}
                        step={10000}
                        value={it.planned || ''}
                        onChange={(e) =>
                          update(it.id, {
                            planned: Math.max(0, Number(e.target.value) || 0),
                          })
                        }
                        placeholder="금액(원)"
                        className="min-h-11 w-full rounded border px-3 py-2 text-right text-base tabular-nums sm:min-h-9 sm:text-sm"
                      />
                    </div>
                    <div className="col-span-5 sm:col-span-4">
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
                        aria-label={`${it.item || '예산 항목'} 삭제`}
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

function CatBar({
  cat,
  value,
  total,
}: {
  cat: BudgetCategory
  value: number
  total: number
}) {
  const pct = total === 0 ? 0 : Math.round((value / total) * 100)
  return (
    <div className="rounded border border-ink-700 bg-ink-800/40 px-3 py-2">
      <div className="flex items-baseline justify-between">
        <span className="text-xs text-ink-300">{cat}</span>
        <span className="text-[11px] tabular-nums text-ink-500">{pct}%</span>
      </div>
      <div className="mt-1 text-sm tabular-nums text-ink-100">{formatKRW(value)}</div>
      <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-ink-700">
        <div
          className="h-full rounded-full bg-emerald-400/70"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
