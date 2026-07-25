import { AppState } from '../types'
import { detectIssues } from './missingCheck'
import { MEETING_CATEGORY_LABEL } from './meetingLogs'

// 현재 상태의 critical 이슈 + 위험 항목을 회의 안건 초안으로 변환한다.
// 사용자가 직접 작성한 안건 위에 prepend되는 형태로 쓰인다.
export function suggestAgenda(state: AppState): string {
  const issues = detectIssues(state)
  const criticals = issues.filter((i) => i.level === 'critical')
  const risks = state.checklist.filter((i) => i.status === 'risk')
  const noteItems = extractMeetingNoteItems(state.documents.meetingNotes)
  const indexedItems = state.meetingLogs
    .flatMap((log) =>
      log.items
        .filter((item) => item.category !== 'general' && item.category !== 'reference')
        .map((item) => ({
          label: MEETING_CATEGORY_LABEL[item.category],
          department: log.department,
          text: item.text,
        })),
    )
    .slice(0, 8)

  const stamp = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })

  const lines: string[] = []
  lines.push(`[자동 안건 초안 — ${stamp}]`)

  let n = 0
  for (const issue of criticals) {
    lines.push(`${++n}) ${issue.message} — 처리 방안 결정`)
  }
  for (const r of risks) {
    const note = r.note ? ` (${r.note})` : ''
    lines.push(`${++n}) ${r.category} · ${r.title || '(제목 없음)'}${note} — 대응 결정`)
  }
  for (const note of noteItems) {
    lines.push(`${++n}) 회의록 메모: ${note} — 후속 결정`)
  }
  for (const item of indexedItems) {
    lines.push(`${++n}) [${item.department}] ${item.label}: ${item.text} — 후속 결정`)
  }

  if (n === 0) {
    lines.push('현재 감지된 위험/누락 항목이 없습니다.')
  }

  return lines.join('\n')
}

function extractMeetingNoteItems(notes: string): string[] {
  const keywords = ['결정', '미정', '확인', '보류', '액션', 'todo', 'to-do', '체크', '?']
  return notes
    .split('\n')
    .map((line) => line.trim().replace(/^[-*•\d.)\s]+/, ''))
    .filter(Boolean)
    .filter((line) => keywords.some((keyword) => line.toLowerCase().includes(keyword)))
    .slice(0, 6)
}
