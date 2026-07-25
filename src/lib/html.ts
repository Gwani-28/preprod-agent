import {
  AppState,
  BUDGET_CATEGORIES,
  CATEGORIES,
  STATUS_LABEL,
} from '../types'
import { daysBetween, formatRange } from './dday'
import { detectIssues } from './missingCheck'
import { statsByCategory, statsOf } from './progress'
import { formatKRW, totalByCategory, totalOf } from './budget'
import { assetsByCategory, visualCategoryLabel } from './visuals'
import { groupedMeetingItems } from './meetingLogs'
import {
  SHOOTING_INFO_LABELS,
  formatTimelineTime,
  shootingTimelineTypeLabel,
  sortTimelineItems,
} from './shooting'

export function toHtml(state: AppState): string {
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
  const budgetTotal = totalOf(budget)
  const budgetByCat = totalByCategory(budget)
  const visualGroups = assetsByCategory(assets)
  const meetingGroups = groupedMeetingItems(meetingLogs)
  const hasMeetingArchive = meetingLogs.length > 0 || documents.meetingNotes.trim()

  const docSection = (title: string, body: string) => `
    <section class="section">
      <h2>${escapeHtml(title)}</h2>
      <p>${multiline(body)}</p>
    </section>`

  const budgetHtml =
    budget.length === 0
      ? '<p class="muted">(예산 미입력)</p>'
      : `
        <p class="lead"><span>총액</span><strong>${escapeHtml(formatKRW(budgetTotal))}</strong><span>${budget.length}개 항목</span></p>
        <div class="metric-grid">
          ${BUDGET_CATEGORIES.map((category) => {
            const amount = budgetByCat[category]
            if (amount === 0) return ''
            const pct = budgetTotal === 0 ? 0 : Math.round((amount / budgetTotal) * 100)
            return `<div class="metric"><span>${escapeHtml(category)}</span><strong>${escapeHtml(formatKRW(amount))}</strong><small>${pct}%</small></div>`
          }).join('')}
        </div>`

  const crewHtml =
    crew.length === 0
      ? '<p class="muted">(스태프 미입력)</p>'
      : `<div class="table-wrap"><table>
          <thead><tr><th>역할</th><th>이름 / 업체</th><th>연락처</th><th>메모</th></tr></thead>
          <tbody>${crew
            .map(
              (member) =>
                `<tr><td>${escapeHtml(member.role || '-')}</td><td>${escapeHtml(member.name || '-')}</td><td>${escapeHtml(member.contact || '-')}</td><td>${escapeHtml(member.note || '-')}</td></tr>`,
            )
            .join('')}</tbody>
        </table></div>`

  const checklistHtml = CATEGORIES.map((category) => {
    const stats = byCat[category]
    if (stats.total === 0) return ''
    const items = checklist.filter((item) => item.category === category && item.status !== 'na')
    return `
      <div class="check-block">
        <div class="check-head"><strong>${escapeHtml(category)}</strong><span>${stats.done}/${stats.total} · ${stats.percent}%</span></div>
        <ul>
          ${items
            .map(
              (item) =>
                `<li><span class="status">${escapeHtml(STATUS_LABEL[item.status])}</span>${escapeHtml(item.title || '(제목 없음)')}${item.note ? `<small>${escapeHtml(item.note)}</small>` : ''}</li>`,
            )
            .join('')}
        </ul>
      </div>`
  }).join('')

  const issueHtml =
    issues.length === 0
      ? '<p class="muted">현재 감지된 이슈가 없습니다.</p>'
      : `<ul class="issues">${issues
          .map(
            (issue) =>
              `<li class="${issue.level}"><span></span>${escapeHtml(issue.message)}</li>`,
          )
          .join('')}</ul>`

  const visualHtml =
    visualGroups.length === 0
      ? '<p class="muted">(비주얼 자료 없음)</p>'
      : visualGroups
          .map(
            (group) => `
              <div class="visual-group">
                <h3>${escapeHtml(group.label)}</h3>
                <div class="visual-grid">
                  ${group.assets
                    .map(
                      (asset) => `
                        <figure>
                          <img src="${escapeAttr(asset.dataUrl)}" alt="${escapeAttr(asset.title || visualCategoryLabel(asset.category))}" />
                          <figcaption>
                            <strong>${escapeHtml(asset.title || visualCategoryLabel(asset.category))}</strong>
                            ${asset.note ? `<span>${escapeHtml(asset.note)}</span>` : ''}
                          </figcaption>
                        </figure>`,
                    )
                    .join('')}
                </div>
              </div>`,
          )
          .join('')

  const shootingHtml =
    shootingDays.length === 0
      ? '<p class="muted">(일촬표 미입력)</p>'
      : shootingDays
          .map((day) => {
            const metaItems = [
              ['날씨', [day.weather, day.lowTemp, day.highTemp, day.rainChance].filter(Boolean).join(' / ')],
              ['일출/일몰', [day.sunrise, day.sunset].filter(Boolean).join(' / ')],
              ['콜타임', day.callTime],
              ['종료/복귀', day.wrapTime],
              ['베이스', day.basecamp],
            ].filter(([, value]) => value)

            const sceneHtml =
              day.scenes.length === 0
                ? ''
                : `<h3>씬별 촬영표</h3>
                  <div class="table-wrap"><table class="compact-table">
                    <thead><tr><th>S#</th><th>장소</th><th>구분</th><th>시간</th><th>컷</th><th>내용</th><th>등장</th></tr></thead>
                    <tbody>${day.scenes
                      .map((scene) => {
                        const markers = [scene.sol, scene.dayNight, scene.inOut].filter(Boolean).join('/')
                        return `<tr><td>${escapeHtml(scene.sceneNo || '-')}</td><td>${escapeHtml(scene.location || '-')}</td><td>${escapeHtml(markers || '-')}</td><td>${escapeHtml(scene.time || '-')}</td><td>${scene.cutCount > 0 ? scene.cutCount : '-'}</td><td>${escapeHtml(scene.description || '-')}</td><td>${escapeHtml(scene.cast || '-')}</td></tr>`
                      })
                      .join('')}</tbody>
                  </table></div>`

            const timelineHtml =
              day.timeline.length === 0
                ? ''
                : `<h3>Time Table</h3>
                  <div class="check-block"><ul>
                    ${sortTimelineItems(day.timeline)
                      .map(
                        (item) =>
                          `<li><span class="status">${escapeHtml(formatTimelineTime(item))}</span><strong>${escapeHtml(shootingTimelineTypeLabel(item.type))}</strong> ${escapeHtml(item.content || '-')}${item.note ? `<small>${escapeHtml(item.note)}</small>` : ''}</li>`,
                      )
                      .join('')}
                  </ul></div>`

            const infoHtml =
              day.info.length === 0
                ? ''
                : `<h3>현장 정보</h3>
                  <div class="check-block"><ul>
                    ${day.info
                      .map((item) => {
                        const typeLabel = SHOOTING_INFO_LABELS[item.type] || item.type
                        const label = item.label || typeLabel
                        const parts = [item.name, item.contact, item.note].filter(Boolean).join(' / ')
                        return `<li><span class="status">${escapeHtml(typeLabel)}</span><strong>${escapeHtml(label)}</strong>${parts ? ` ${escapeHtml(parts)}` : ''}</li>`
                      })
                      .join('')}
                  </ul></div>`

            return `
              <article class="shooting-day">
                <div class="shooting-head">
                  <h3>${escapeHtml(day.title || '회차')}${day.date ? ` <span>${escapeHtml(day.date)}</span>` : ''}</h3>
                  <small>씬 ${day.scenes.length} · 시간표 ${day.timeline.length}</small>
                </div>
                ${
                  metaItems.length > 0
                    ? `<dl class="shooting-meta">${metaItems
                        .map(
                          ([label, value]) =>
                            `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`,
                        )
                        .join('')}</dl>`
                    : ''
                }
                ${sceneHtml}
                ${timelineHtml}
                ${infoHtml}
                ${day.notes.trim() ? `<p class="shooting-note">${multiline(day.notes)}</p>` : ''}
              </article>`
          })
          .join('')

  const meetingHtml = !hasMeetingArchive
    ? ''
    : `
      ${meetingGroups
        .map(
          (group) => `
            <div class="check-block">
              <div class="check-head"><strong>${escapeHtml(group.label)}</strong><span>${group.items.length}건</span></div>
              <ul>
                ${group.items
                  .map(
                    (item) =>
                      `<li><span class="status">${escapeHtml(item.log.department)}</span>${escapeHtml(item.text)}</li>`,
                  )
                  .join('')}
              </ul>
            </div>`,
        )
        .join('')}
      ${documents.meetingNotes.trim() ? `<p>${multiline(documents.meetingNotes)}</p>` : ''}`

  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(project.title || 'PPM')} - PPM Book</title>
  <style>
    :root { color-scheme: light; font-family: Inter, Pretendard, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: #111827; background: #f3f4f6; }
    * { box-sizing: border-box; }
    body { margin: 0; background: #f3f4f6; }
    main { width: min(1120px, calc(100% - 32px)); margin: 0 auto; padding: 32px 0 56px; }
    .cover, .section { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 28px; margin-bottom: 16px; break-inside: avoid; }
    .cover { min-height: 320px; display: flex; flex-direction: column; justify-content: flex-end; background: #111827; color: #f9fafb; }
    .eyebrow { margin: 0 0 12px; font-size: 12px; letter-spacing: .12em; text-transform: uppercase; color: #d1d5db; }
    h1 { margin: 0; font-size: clamp(32px, 7vw, 76px); line-height: .95; letter-spacing: 0; }
    h2 { margin: 0 0 14px; font-size: 20px; letter-spacing: 0; }
    h3 { margin: 0 0 10px; font-size: 15px; }
    p { margin: 0; line-height: 1.7; white-space: pre-wrap; }
    .logline { margin-top: 18px; max-width: 760px; color: #d1d5db; font-size: 18px; }
    .meta { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px 18px; margin-top: 24px; color: #e5e7eb; }
    .meta div, .overview div { display: flex; gap: 10px; min-width: 0; }
    .meta dt, .overview dt { width: 96px; flex: 0 0 auto; color: #6b7280; font-size: 13px; }
    .meta dt { color: #9ca3af; }
    .meta dd, .overview dd { margin: 0; font-size: 14px; overflow-wrap: anywhere; }
    .overview { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px 18px; }
    .overview .wide { grid-column: 1 / -1; }
    .muted { color: #6b7280; }
    .lead { display: flex; align-items: baseline; flex-wrap: wrap; gap: 10px; margin-bottom: 14px; }
    .lead strong { font-size: 24px; }
    .metric-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; }
    .metric { border: 1px solid #e5e7eb; border-radius: 6px; padding: 10px; }
    .metric span, .metric small { display: block; color: #6b7280; font-size: 12px; }
    .metric strong { display: block; margin-top: 4px; font-size: 15px; }
    .table-wrap { overflow-x: auto; }
    table { width: 100%; min-width: 680px; border-collapse: collapse; font-size: 13px; }
    th { color: #6b7280; font-weight: 600; text-align: left; border-top: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb; padding: 9px 10px 9px 0; }
    td { border-bottom: 1px solid #f3f4f6; padding: 9px 10px 9px 0; vertical-align: top; }
    .visual-group + .visual-group { margin-top: 22px; }
    .visual-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
    figure { margin: 0; border: 1px solid #e5e7eb; border-radius: 6px; overflow: hidden; background: #fff; }
    figure img { display: block; width: 100%; aspect-ratio: 4 / 3; object-fit: cover; }
    figcaption { padding: 10px; }
    figcaption strong, figcaption span { display: block; }
    figcaption strong { font-size: 13px; }
    figcaption span { margin-top: 4px; color: #4b5563; font-size: 12px; line-height: 1.5; }
    .check-block { border: 1px solid #e5e7eb; border-radius: 6px; padding: 12px; margin-top: 10px; }
    .check-head { display: flex; justify-content: space-between; gap: 12px; font-size: 14px; }
    .check-head span { color: #6b7280; font-size: 12px; }
    .shooting-day { border: 1px solid #e5e7eb; border-radius: 6px; padding: 14px; margin-top: 12px; }
    .shooting-head { display: flex; justify-content: space-between; gap: 12px; align-items: baseline; margin-bottom: 10px; }
    .shooting-head h3 { margin: 0; }
    .shooting-head h3 span, .shooting-head small { color: #6b7280; font-size: 12px; font-weight: 400; }
    .shooting-meta { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px 18px; margin: 0 0 14px; }
    .shooting-meta div { display: flex; gap: 10px; }
    .shooting-meta dt { width: 82px; flex: 0 0 auto; color: #6b7280; font-size: 12px; }
    .shooting-meta dd { margin: 0; font-size: 13px; overflow-wrap: anywhere; }
    .shooting-note { margin-top: 12px; color: #4b5563; font-size: 13px; }
    .compact-table { min-width: 760px; }
    ul { margin: 10px 0 0; padding-left: 18px; }
    li { margin: 5px 0; line-height: 1.5; }
    li small { margin-left: 8px; color: #6b7280; }
    .status { display: inline-block; min-width: 42px; margin-right: 8px; color: #6b7280; font-size: 11px; }
    .issues { list-style: none; padding: 0; }
    .issues li { display: flex; gap: 8px; align-items: baseline; }
    .issues span { width: 7px; height: 7px; border-radius: 999px; flex: 0 0 auto; background: #f59e0b; }
    .issues .critical span { background: #ef4444; }
    @media (max-width: 760px) {
      main { width: min(100% - 20px, 1120px); padding-top: 16px; }
      .cover, .section { padding: 20px; }
      .meta, .overview, .metric-grid, .visual-grid, .shooting-meta { grid-template-columns: 1fr; }
      .shooting-head { display: block; }
    }
    @media print {
      :root, body { background: #fff; }
      main { width: 100%; padding: 0; }
      .cover, .section { border: 0; border-radius: 0; page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <main>
    <section class="cover">
      <p class="eyebrow">PPM Book</p>
      <h1>${escapeHtml(project.title || '(프로젝트명 미입력)')}</h1>
      <p class="logline">${escapeHtml(project.logline || '(한 줄 소개 미입력)')}</p>
      <dl class="meta">
        ${row('포맷', project.format)}
        ${row('장르', project.genre)}
        ${row('촬영', shootRange)}
        ${row('제작 규모', project.productionScale)}
        ${row('연출', project.director)}
        ${row('프로듀서', project.producer)}
      </dl>
    </section>

    <section class="section">
      <h2>1. 프로젝트 개요</h2>
      <dl class="overview">
        ${row('포맷', project.format)}
        ${row('장르', project.genre)}
        ${row('러닝타임', project.runtime > 0 ? `${project.runtime}분` : '')}
        ${row('촬영', `${shootRange || '-'}${shootDays !== null ? ` (${shootDays}일)` : ''}`)}
        ${row('제작 규모', project.productionScale)}
        ${row('주요 로케이션', project.mainLocations.join(', '), 'wide')}
      </dl>
    </section>

    <section class="section"><h2>2. Staff List</h2>${crewHtml}</section>
    ${docSection('3. 기획의도', documents.intention)}
    ${docSection('4. 연출 방향', documents.directing)}
    ${docSection('5. 톤앤매너', documents.toneAndManner)}
    ${docSection('6. 레퍼런스', documents.references)}
    <section class="section"><h2>7. 비주얼 보드</h2>${visualHtml}</section>
    ${docSection('8. 시나리오 / 콘티', documents.storyboard)}
    ${docSection('9. 제작 방향', documents.productionPlan)}
    ${docSection('10. 촬영 전략', documents.shootingStrategy)}
    ${docSection('11. 캐스팅 / 스타일링', documents.castingStyling)}
    ${docSection('12. 미술 / 의상', documents.artCostume)}
    ${docSection('13. 로케이션 노트', documents.locationNote)}
    ${docSection('14. 소품 / 장비', documents.propsEquipment)}
    ${docSection('15. 촬영 운영표', documents.schedulePlan)}
    <section class="section"><h2>16. 일일촬영 계획표</h2>${shootingHtml}</section>
    <section class="section"><h2>17. 예산 개요</h2>${budgetHtml}</section>
    <section class="section">
      <h2>18. 프리프로덕션 진행 현황</h2>
      <p class="lead"><span>전체 진행률</span><strong>${total.percent}%</strong><span>확정 ${total.done} · 진행중 ${total.progress} · 위험 ${total.risk} · 미시작 ${total.todo}</span></p>
      ${checklistHtml}
    </section>
    <section class="section"><h2>19. 미확정 / 위험 항목</h2>${issueHtml}</section>
    ${docSection('20. 회의 안건', documents.meetingAgenda)}
    ${hasMeetingArchive ? `<section class="section"><h2>21. 회의록 색인</h2>${meetingHtml}</section>` : ''}
    ${documents.riskMemo.trim() ? docSection(`${hasMeetingArchive ? '22' : '21'}. 리스크 메모`, documents.riskMemo) : ''}
  </main>
</body>
</html>`
}

function row(label: string, value: string, className = '') {
  return `<div class="${escapeAttr(className)}"><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value || '-')}</dd></div>`
}

function multiline(value: string) {
  return escapeHtml(value.trim() || '(미입력)')
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function escapeAttr(value: string) {
  return escapeHtml(value).replace(/`/g, '&#96;')
}
