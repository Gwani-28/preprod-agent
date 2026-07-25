// 촬영 시작일 기준 D-day + 종료일까지 일수 계산.

function parseISO(dateISO: string | undefined | null): Date | null {
  if (!dateISO) return null
  const d = new Date(`${dateISO}T00:00:00`)
  return Number.isNaN(d.getTime()) ? null : d
}

export function daysUntil(dateISO: string | undefined | null): number | null {
  const target = parseISO(dateISO)
  if (!target) return null
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  return Math.round((target.getTime() - today.getTime()) / 86_400_000)
}

export function ddayLabel(days: number | null): string {
  if (days === null) return '—'
  if (days === 0) return 'D-DAY'
  if (days > 0) return `D-${days}`
  return `D+${-days}`
}

// 시작일~종료일 사이 일수 (양 끝 포함).
// 6/10 ~ 6/14 = 5일.
export function daysBetween(
  startISO: string | undefined | null,
  endISO: string | undefined | null,
): number | null {
  const s = parseISO(startISO)
  const e = parseISO(endISO)
  if (!s || !e) return null
  const diff = (e.getTime() - s.getTime()) / 86_400_000
  if (diff < 0) return null
  return Math.floor(diff) + 1
}

export function formatRange(
  startISO: string | undefined | null,
  endISO: string | undefined | null,
): string {
  if (!startISO && !endISO) return ''
  if (startISO && !endISO) return startISO
  if (!startISO && endISO) return endISO
  return `${startISO} ~ ${endISO}`
}

export type Pressure = 'none' | 'far' | 'd30' | 'd14' | 'd7' | 'd0'

export function pressureOf(days: number | null): Pressure {
  if (days === null) return 'none'
  if (days < 0) return 'd0'
  if (days <= 7) return 'd7'
  if (days <= 14) return 'd14'
  if (days <= 30) return 'd30'
  return 'far'
}
