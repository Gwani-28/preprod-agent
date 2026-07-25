import { AppState, ChecklistCategory, ChecklistItem, TabKey } from '../types'
import { daysUntil } from './dday'
import { totalOf } from './budget'

export type IssueLevel = 'critical' | 'warning'

export interface Issue {
  level: IssueLevel
  message: string
  tab: TabKey
  ref?: string
}

function noneDone(items: ChecklistItem[], category: ChecklistCategory) {
  const inCat = items.filter((i) => i.category === category && i.status !== 'na')
  if (inCat.length === 0) return false
  return inCat.every((i) => i.status !== 'done')
}

function allTodo(items: ChecklistItem[], category: ChecklistCategory) {
  const inCat = items.filter((i) => i.category === category && i.status !== 'na')
  if (inCat.length === 0) return false
  return inCat.every((i) => i.status === 'todo')
}

export function detectIssues(state: AppState): Issue[] {
  const issues: Issue[] = []
  const { project, checklist, documents, budget } = state
  const dday = daysUntil(project.shootStartDate)
  const tag =
    dday === null ? '' : dday >= 0 ? `D-${dday} · ` : `D+${-dday} · `

  // 프로젝트 개요
  if (!project.title.trim())
    issues.push({ level: 'critical', message: '프로젝트명이 비어 있습니다.', tab: 'dashboard' })
  if (!project.logline.trim())
    issues.push({ level: 'critical', message: '한 줄 소개가 비어 있습니다.', tab: 'dashboard' })
  if (!project.shootStartDate)
    issues.push({
      level: 'critical',
      message: '촬영 시작일이 비어 있습니다.',
      tab: 'dashboard',
    })
  if (project.shootStartDate && !project.shootEndDate)
    issues.push({
      level: 'warning',
      message: '촬영 종료일이 비어 있습니다.',
      tab: 'dashboard',
    })
  if (!project.runtime || project.runtime <= 0)
    issues.push({ level: 'warning', message: '러닝타임이 미입력입니다.', tab: 'dashboard' })
  if (project.mainLocations.length === 0)
    issues.push({ level: 'warning', message: '주요 로케이션이 비어 있습니다.', tab: 'dashboard' })
  if (!project.director.trim())
    issues.push({ level: 'warning', message: '연출 담당자가 미입력입니다.', tab: 'dashboard' })
  if (!project.producer.trim())
    issues.push({ level: 'warning', message: '프로듀서가 미입력입니다.', tab: 'dashboard' })

  if (state.crew.filter((member) => member.role.trim() || member.name.trim()).length === 0)
    issues.push({
      level: 'warning',
      message: '스태프 리스트가 비어 있습니다.',
      tab: 'crew',
    })

  // 카테고리 상시 룰 — D-day 태그 prepend.
  if (noneDone(checklist, '로케이션'))
    issues.push({
      level: 'critical',
      message: `${tag}로케이션 미확정`,
      tab: 'checklist',
      ref: '로케이션',
    })
  if (noneDone(checklist, '캐스팅'))
    issues.push({
      level: 'critical',
      message: `${tag}캐스팅 미확정`,
      tab: 'checklist',
      ref: '캐스팅',
    })
  if (allTodo(checklist, '제작/예산'))
    issues.push({
      level: 'critical',
      message: `${tag}예산 작업 전반 미시작`,
      tab: 'checklist',
      ref: '제작/예산',
    })
  if (allTodo(checklist, '스태프/계약'))
    issues.push({
      level: 'warning',
      message: `${tag}스태프/계약 작업 전반 미시작`,
      tab: 'checklist',
      ref: '스태프/계약',
    })
  if (allTodo(checklist, '데이터/후반'))
    issues.push({
      level: 'warning',
      message: `${tag}데이터/후반 플로우 미정`,
      tab: 'checklist',
      ref: '데이터/후반',
    })
  if (allTodo(checklist, '안전/허가'))
    issues.push({
      level: 'critical',
      message: `${tag}안전/허가 전반 미시작`,
      tab: 'checklist',
      ref: '안전/허가',
    })

  // D-day 기반 시간 격상 룰.
  if (dday !== null) {
    if (dday <= 21 && allTodo(checklist, '시나리오'))
      issues.push({
        level: 'critical',
        message: `${tag}시나리오 전반 미시작 (촬영 21일 이내)`,
        tab: 'checklist',
        ref: '시나리오',
      })
    if (dday <= 7 && allTodo(checklist, '스케줄'))
      issues.push({
        level: 'critical',
        message: `${tag}스케줄/회차표 미작성 (촬영 7일 이내)`,
        tab: 'checklist',
        ref: '스케줄',
      })
    if (dday <= 7 && allTodo(checklist, '촬영/조명'))
      issues.push({
        level: 'critical',
        message: `${tag}촬영/조명 준비 미시작 (촬영 7일 이내)`,
        tab: 'checklist',
        ref: '촬영/조명',
      })
  }

  // 예산 모듈 룰
  if (budget.length === 0) {
    issues.push({
      level: 'critical',
      message: '예산이 입력되지 않았습니다.',
      tab: 'budget',
    })
  } else if (totalOf(budget) === 0) {
    issues.push({
      level: 'critical',
      message: '예산 총액이 0원입니다.',
      tab: 'budget',
    })
  }

  // 위험 항목 개별 노출
  for (const r of checklist.filter((i) => i.status === 'risk')) {
    issues.push({
      level: 'warning',
      message: `위험 항목: ${r.category} / ${r.title || '(제목 없음)'}`,
      tab: 'checklist',
      ref: r.category,
    })
  }

  // 문서
  if (!documents.intention.trim())
    issues.push({
      level: 'warning',
      message: '기획의도가 비어 있습니다.',
      tab: 'documents',
      ref: 'intention',
    })
  if (!documents.directing.trim())
    issues.push({
      level: 'warning',
      message: '연출 방향이 비어 있습니다.',
      tab: 'documents',
      ref: 'directing',
    })
  if (!documents.toneAndManner.trim())
    issues.push({
      level: 'warning',
      message: '톤앤매너가 비어 있습니다.',
      tab: 'documents',
      ref: 'toneAndManner',
    })
  if (!documents.storyboard.trim())
    issues.push({
      level: 'warning',
      message: '시나리오/콘티 메모가 비어 있습니다.',
      tab: 'documents',
      ref: 'storyboard',
    })
  if (!documents.castingStyling.trim())
    issues.push({
      level: 'warning',
      message: '캐스팅/스타일링 메모가 비어 있습니다.',
      tab: 'documents',
      ref: 'castingStyling',
    })
  if (!documents.propsEquipment.trim())
    issues.push({
      level: 'warning',
      message: '소품/장비 메모가 비어 있습니다.',
      tab: 'documents',
      ref: 'propsEquipment',
    })
  if (!documents.schedulePlan.trim())
    issues.push({
      level: 'warning',
      message: '촬영 운영표가 비어 있습니다.',
      tab: 'documents',
      ref: 'schedulePlan',
    })
  if (!documents.meetingAgenda.trim())
    issues.push({
      level: 'critical',
      message: '회의 안건이 비어 있습니다.',
      tab: 'documents',
      ref: 'meetingAgenda',
    })

  if (state.assets.length === 0)
    issues.push({
      level: 'warning',
      message: 'PPM에 들어갈 비주얼 자료가 없습니다.',
      tab: 'visuals',
    })

  if (state.shootingDays.length === 0)
    issues.push({
      level: 'warning',
      message: '일일촬영 계획표가 아직 없습니다.',
      tab: 'shooting',
    })

  return issues
}

export function attentionItems(items: ChecklistItem[]): ChecklistItem[] {
  return [
    ...items.filter((i) => i.status === 'risk'),
    ...items.filter((i) => i.status === 'progress'),
  ]
}
