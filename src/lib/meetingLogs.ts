import { MeetingItemCategory, MeetingLog, MeetingLogItem } from '../types'

export const MEETING_DEPARTMENTS = [
  '전체',
  '연출',
  '제작',
  '촬영/조명',
  '미술/의상',
  '캐스팅',
  '로케이션',
  '사운드',
  '후반',
  '클라이언트',
]

export const MEETING_CATEGORY_LABEL: Record<MeetingItemCategory, string> = {
  decision: '결정사항',
  action: '액션',
  open: '미정/확인',
  risk: '리스크',
  reference: '참고',
  general: '일반 메모',
}

const ORDER: MeetingItemCategory[] = ['decision', 'action', 'open', 'risk', 'reference', 'general']

export function makeMeetingLog({
  title,
  department,
  sourceName,
  rawText,
}: {
  title: string
  department: string
  sourceName: string
  rawText: string
}): MeetingLog {
  const createdAt = new Date().toISOString()
  return {
    id: `meeting-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: title.trim() || sourceName || '회의록',
    department: department.trim() || '전체',
    sourceName,
    createdAt,
    rawText,
    items: classifyMeetingText(rawText),
  }
}

export function classifyMeetingText(rawText: string): MeetingLogItem[] {
  return rawText
    .split('\n')
    .map(cleanLine)
    .filter(Boolean)
    .map((text, index) => ({
      id: `note-${Date.now()}-${index}`,
      category: classifyLine(text),
      text,
    }))
}

export function groupedMeetingItems(logs: MeetingLog[]) {
  return ORDER.map((category) => ({
    category,
    label: MEETING_CATEGORY_LABEL[category],
    items: logs.flatMap((log) =>
      log.items
        .filter((item) => item.category === category)
        .map((item) => ({ ...item, log })),
    ),
  })).filter((group) => group.items.length > 0)
}

export function serializeMeetingLogs(logs: MeetingLog[]) {
  return logs
    .map((log) => {
      const header = `[${log.department}] ${log.title}`
      const items = log.items
        .map((item) => `- ${MEETING_CATEGORY_LABEL[item.category]}: ${item.text}`)
        .join('\n')
      return `${header}\n${items || log.rawText}`
    })
    .join('\n\n---\n\n')
}

function cleanLine(line: string) {
  return line
    .trim()
    .replace(/^[-*•\d.)\s]+/, '')
    .replace(/^\[[^\]]+\]\s*/, '')
}

function classifyLine(line: string): MeetingItemCategory {
  const lower = line.toLowerCase()
  if (hasAny(lower, ['리스크', '위험', '문제', '이슈', '불가', '지연', '우려'])) return 'risk'
  if (hasAny(lower, ['액션', 'todo', 'to-do', '담당', '진행', '해야', '요청', '전달'])) return 'action'
  if (hasAny(lower, ['미정', '확인', '보류', '검토', '체크', '질문', '?'])) return 'open'
  if (hasAny(lower, ['결정', '확정', '승인', '픽스', 'fix'])) return 'decision'
  if (hasAny(lower, ['참고', '레퍼런스', '공유', '링크'])) return 'reference'
  return 'general'
}

function hasAny(text: string, keywords: string[]) {
  return keywords.some((keyword) => text.includes(keyword))
}
