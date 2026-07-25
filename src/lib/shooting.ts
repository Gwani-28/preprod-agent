import {
  ShootingDay,
  ShootingInfoType,
  ShootingTimelineItem,
  ShootingTimelineType,
} from '../types'

export const SHOOTING_INFO_LABELS: Record<ShootingInfoType, string> = {
  staff: '스태프',
  cast: '배우',
  location: '촬영지',
  meal: '식대',
  notice: '공지',
}

export const SHOOTING_TIMELINE_TYPES: {
  key: ShootingTimelineType
  label: string
}[] = [
  { key: 'call', label: '콜' },
  { key: 'move', label: '이동' },
  { key: 'setup', label: '세팅' },
  { key: 'hmu', label: 'HMU' },
  { key: 'rehearsal', label: '리허설' },
  { key: 'shoot', label: '촬영' },
  { key: 'meal', label: '식사' },
  { key: 'wrap', label: '철수' },
  { key: 'etc', label: '기타' },
]

export function shootingTimelineTypeLabel(type: ShootingTimelineType) {
  return SHOOTING_TIMELINE_TYPES.find((item) => item.key === type)?.label ?? '기타'
}

export function formatTimelineTime(item: ShootingTimelineItem) {
  const start = item.startTime || parseTimeRange(item.time).startTime
  const end = item.endTime || parseTimeRange(item.time).endTime
  if (start && end) return `${start} - ${end}`
  if (start) return start
  if (end) return end
  return item.time || '-'
}

export function sortTimelineItems(items: ShootingTimelineItem[]) {
  return [...items].sort((a, b) => timelineSortValue(a) - timelineSortValue(b))
}

export function normalizeShootingDay(day: ShootingDay): ShootingDay {
  return {
    ...day,
    timeline: Array.isArray(day.timeline)
      ? day.timeline.map(normalizeTimelineItem)
      : [],
  }
}

function normalizeTimelineItem(item: ShootingTimelineItem): ShootingTimelineItem {
  const parsed = parseTimeRange(item.time)
  const type = item.type ?? inferTimelineType(item.content)
  const startTime = item.startTime ?? parsed.startTime
  const endTime = item.endTime ?? parsed.endTime
  return {
    id: item.id,
    time: item.time ?? formatTimeRange(startTime, endTime),
    startTime,
    endTime,
    type,
    content: item.content ?? '',
    note: item.note ?? '',
  }
}

function inferTimelineType(content = ''): ShootingTimelineType {
  if (/콜|집합|도착/.test(content)) return 'call'
  if (/이동|복귀/.test(content)) return 'move'
  if (/세팅|장비|조명/.test(content)) return 'setup'
  if (/헤어|메이크|분장|HMU/i.test(content)) return 'hmu'
  if (/리허설|동선/.test(content)) return 'rehearsal'
  if (/촬영|씬|S#|scene/i.test(content)) return 'shoot'
  if (/식사|점심|저녁|아침/.test(content)) return 'meal'
  if (/철수|백업|랩|wrap/i.test(content)) return 'wrap'
  return 'etc'
}

function parseTimeRange(value = '') {
  const matches = value.match(/\d{1,2}:\d{2}/g) ?? []
  return {
    startTime: normalizeTime(matches[0] ?? ''),
    endTime: normalizeTime(matches[1] ?? ''),
  }
}

function normalizeTime(value: string) {
  if (!value) return ''
  const [h, m] = value.split(':')
  return `${h.padStart(2, '0')}:${m}`
}

function formatTimeRange(startTime: string, endTime: string) {
  if (startTime && endTime) return `${startTime} - ${endTime}`
  return startTime || endTime || ''
}

function timelineSortValue(item: ShootingTimelineItem) {
  const time = item.startTime || parseTimeRange(item.time).startTime || item.endTime
  if (!time) return Number.MAX_SAFE_INTEGER
  const [hours, minutes] = time.split(':').map(Number)
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return Number.MAX_SAFE_INTEGER
  return hours * 60 + minutes
}
