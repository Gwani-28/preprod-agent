import { CATEGORIES, ChecklistCategory, ChecklistItem } from '../types'

export interface ProgressStats {
  total: number // '불필요'(na)는 분모에서 제외
  done: number
  progress: number
  risk: number
  todo: number
  na: number
  percent: number // done / total (na 제외) * 100
}

export function statsOf(items: ChecklistItem[]): ProgressStats {
  const done = items.filter((i) => i.status === 'done').length
  const progress = items.filter((i) => i.status === 'progress').length
  const risk = items.filter((i) => i.status === 'risk').length
  const todo = items.filter((i) => i.status === 'todo').length
  const na = items.filter((i) => i.status === 'na').length
  const total = items.length - na
  const percent = total === 0 ? 0 : Math.round((done / total) * 100)
  return { total, done, progress, risk, todo, na, percent }
}

export function statsByCategory(items: ChecklistItem[]): Record<ChecklistCategory, ProgressStats> {
  const result = {} as Record<ChecklistCategory, ProgressStats>
  for (const c of CATEGORIES) {
    result[c] = statsOf(items.filter((i) => i.category === c))
  }
  return result
}
