import { AppState, BUDGET_CATEGORIES, CATEGORIES, STATUS_LABEL } from '../types'
import { statsByCategory, statsOf } from './progress'
import { detectIssues } from './missingCheck'
import { daysBetween, formatRange } from './dday'
import { formatKRW, totalByCategory, totalOf } from './budget'
import { assetsByCategory, visualCategoryLabel } from './visuals'
import { groupedMeetingItems } from './meetingLogs'
import {
  SHOOTING_INFO_LABELS,
  formatTimelineTime,
  shootingTimelineTypeLabel,
  sortTimelineItems,
} from './shooting'

export function toMarkdown(state: AppState): string {
  const {
    project,
    checklist,
    documents,
    budget,
    assets,
    crew,
    meetingLogs,
    shootingDays,
  } = state
  const total = statsOf(checklist)
  const byCat = statsByCategory(checklist)
  const issues = detectIssues(state)
  const shootRange = formatRange(project.shootStartDate, project.shootEndDate)
  const shootDays = daysBetween(project.shootStartDate, project.shootEndDate)
  const runtimeLabel = project.runtime > 0 ? `${project.runtime}분` : '-'
  const locationLabel =
    project.mainLocations.length > 0 ? project.mainLocations.join(', ') : '-'
  const meetingGroups = groupedMeetingItems(meetingLogs)
  const hasMeetingArchive = meetingLogs.length > 0 || documents.meetingNotes.trim()

  const lines: string[] = []

  lines.push(`# ${project.title || '(프로젝트명 미입력)'} — PPM Book`)
  lines.push('')
  lines.push(`> ${project.logline || '(한 줄 소개 미입력)'}`)
  lines.push('')

  lines.push('## 1. 프로젝트 개요')
  lines.push('')
  lines.push(`- **포맷**: ${project.format || '-'}`)
  lines.push(`- **장르**: ${project.genre || '-'}`)
  lines.push(`- **러닝타임**: ${runtimeLabel}`)
  lines.push(`- **촬영**: ${shootRange || '-'}${shootDays ? ` (${shootDays}일)` : ''}`)
  lines.push(`- **주요 로케이션**: ${locationLabel}`)
  lines.push(`- **제작 규모**: ${project.productionScale || '-'}`)
  lines.push(`- **연출**: ${project.director || '-'}`)
  lines.push(`- **프로듀서**: ${project.producer || '-'}`)
  lines.push('')

  const section = (title: string, body: string) => {
    lines.push(`## ${title}`)
    lines.push('')
    lines.push(body.trim() || '(미입력)')
    lines.push('')
  }

  lines.push('## 2. Staff List')
  lines.push('')
  if (crew.length === 0) {
    lines.push('(스태프 미입력)')
  } else {
    for (const member of crew) {
      const contact = member.contact ? ` / ${member.contact}` : ''
      const note = member.note ? ` — ${member.note}` : ''
      lines.push(`- **${member.role || '역할 미입력'}**: ${member.name || '이름 미입력'}${contact}${note}`)
    }
  }
  lines.push('')

  section('3. 기획의도', documents.intention)
  section('4. 연출 방향', documents.directing)
  section('5. 톤앤매너', documents.toneAndManner)
  section('6. 레퍼런스', documents.references)
  lines.push('## 7. 비주얼 보드')
  lines.push('')
  const visualGroups = assetsByCategory(assets)
  if (visualGroups.length === 0) {
    lines.push('(비주얼 자료 없음)')
  } else {
    for (const group of visualGroups) {
      lines.push(`### ${group.label}`)
      for (const asset of group.assets) {
        const note = asset.note ? ` — ${asset.note}` : ''
        lines.push(`- ${asset.title || visualCategoryLabel(asset.category)}${note}`)
      }
      lines.push('')
    }
  }
  lines.push('')
  section('8. 시나리오 / 콘티', documents.storyboard)
  section('9. 제작 방향', documents.productionPlan)
  section('10. 촬영 전략', documents.shootingStrategy)
  section('11. 캐스팅 / 스타일링', documents.castingStyling)
  section('12. 미술 / 의상', documents.artCostume)
  section('13. 로케이션 노트', documents.locationNote)
  section('14. 소품 / 장비', documents.propsEquipment)
  section('15. 촬영 운영표', documents.schedulePlan)

  lines.push('## 16. 일일촬영 계획표')
  lines.push('')
  if (shootingDays.length === 0) {
    lines.push('(일촬표 미입력)')
  } else {
    for (const day of shootingDays) {
      lines.push(`### ${day.title || '회차'}${day.date ? ` (${day.date})` : ''}`)
      const dayMeta = [
        ['날씨', [day.weather, day.lowTemp, day.highTemp, day.rainChance].filter(Boolean).join(' / ')],
        ['일출/일몰', [day.sunrise, day.sunset].filter(Boolean).join(' / ')],
        ['콜타임', day.callTime],
        ['종료/복귀', day.wrapTime],
        ['베이스', day.basecamp],
      ].filter(([, value]) => value)

      for (const [label, value] of dayMeta) {
        lines.push(`- **${label}**: ${value}`)
      }

      if (day.scenes.length > 0) {
        lines.push('')
        lines.push('#### 씬별 촬영표')
        for (const scene of day.scenes) {
          const markers = [scene.sol, scene.dayNight, scene.inOut].filter(Boolean).join('/')
          const parts = [
            scene.time || '시간 미정',
            scene.location || '장소 미정',
            markers,
            scene.cutCount > 0 ? `${scene.cutCount}컷` : '',
            scene.cast ? `등장 ${scene.cast}` : '',
          ].filter(Boolean)
          const description = scene.description ? `: ${scene.description}` : ''
          lines.push(`- **S#${scene.sceneNo || '-'}** ${parts.join(' · ')}${description}`)
        }
      }

      if (day.timeline.length > 0) {
        lines.push('')
        lines.push('#### Time Table')
        for (const item of sortTimelineItems(day.timeline)) {
          const note = item.note ? ` — ${item.note}` : ''
          lines.push(
            `- **${formatTimelineTime(item)}** [${shootingTimelineTypeLabel(item.type)}] ${item.content || '-'}${note}`,
          )
        }
      }

      if (day.info.length > 0) {
        lines.push('')
        lines.push('#### 현장 정보')
        for (const item of day.info) {
          const label = item.label || SHOOTING_INFO_LABELS[item.type] || '항목'
          const parts = [item.name, item.contact, item.note].filter(Boolean).join(' / ')
          lines.push(`- **${SHOOTING_INFO_LABELS[item.type] || item.type} · ${label}**: ${parts || '-'}`)
        }
      }

      if (day.notes.trim()) {
        lines.push('')
        lines.push('#### 공지')
        lines.push(day.notes.trim())
      }
      lines.push('')
    }
  }
  lines.push('')

  lines.push('## 17. 예산 개요')
  lines.push('')
  if (budget.length === 0) {
    lines.push('(예산 미입력)')
  } else {
    const sum = totalOf(budget)
    const byBudgetCat = totalByCategory(budget)
    lines.push(`- **총액**: ${formatKRW(sum)} (${budget.length}개 항목)`)
    for (const cat of BUDGET_CATEGORIES) {
      const v = byBudgetCat[cat]
      if (v === 0) continue
      lines.push(`- ${cat}: ${formatKRW(v)}`)
    }
  }
  lines.push('')

  lines.push('## 18. 프리프로덕션 진행 현황')
  lines.push('')
  lines.push(
    `전체 진행률: **${total.percent}%** — 확정 ${total.done} / 진행중 ${total.progress} / 위험 ${total.risk} / 미시작 ${total.todo} (집계 대상 ${total.total}건)`,
  )
  lines.push('')
  for (const cat of CATEGORIES) {
    const s = byCat[cat]
    if (s.total === 0) continue
    lines.push(`### ${cat} (${s.percent}%)`)
    const items = checklist.filter((i) => i.category === cat)
    for (const it of items) {
      const note = it.note ? ` — ${it.note}` : ''
      lines.push(`- [${STATUS_LABEL[it.status]}] ${it.title || '(제목 없음)'}${note}`)
    }
    lines.push('')
  }

  lines.push('## 19. 미확정 / 위험 항목')
  lines.push('')
  if (issues.length === 0) {
    lines.push('현재 감지된 이슈가 없습니다.')
  } else {
    for (const i of issues) {
      const tag = i.level === 'critical' ? '누락' : '주의'
      lines.push(`- ${tag} ${i.message}`)
    }
  }
  lines.push('')

  lines.push('## 20. 회의 안건')
  lines.push('')
  lines.push(documents.meetingAgenda.trim() || '(미입력)')
  lines.push('')

  if (hasMeetingArchive) {
    lines.push('## 21. 회의록 색인')
    lines.push('')
    if (meetingGroups.length > 0) {
      for (const group of meetingGroups) {
        lines.push(`### ${group.label}`)
        for (const item of group.items) {
          lines.push(`- [${item.log.department}] ${item.text}`)
        }
        lines.push('')
      }
    }
    if (documents.meetingNotes.trim()) {
      lines.push(documents.meetingNotes.trim())
    }
    lines.push('')
  }

  if (documents.riskMemo.trim()) {
    lines.push(`## ${hasMeetingArchive ? '22' : '21'}. 리스크 메모`)
    lines.push('')
    lines.push(documents.riskMemo.trim())
    lines.push('')
  }

  return lines.join('\n')
}
