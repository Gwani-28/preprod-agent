import { BUDGET_CATEGORIES, BudgetCategory, BudgetItem } from '../types'

const safe = (n: number) => (Number.isFinite(n) ? n : 0)

export function totalOf(items: BudgetItem[]): number {
  return items.reduce((sum, b) => sum + safe(b.planned), 0)
}

export function totalByCategory(items: BudgetItem[]): Record<BudgetCategory, number> {
  const result = {} as Record<BudgetCategory, number>
  for (const c of BUDGET_CATEGORIES) {
    result[c] = items
      .filter((b) => b.category === c)
      .reduce((sum, b) => sum + safe(b.planned), 0)
  }
  return result
}

const krwFormatter = new Intl.NumberFormat('ko-KR')

export function formatKRW(n: number): string {
  return `${krwFormatter.format(Math.round(safe(n)))}원`
}
