import { ReactNode } from 'react'
import { AppState, BUDGET_CATEGORIES, CATEGORIES } from '../types'
import { StatusBadge } from '../components/ui/StatusBadge'
import { statsByCategory, statsOf } from '../lib/progress'
import { detectIssues } from '../lib/missingCheck'
import { daysBetween, formatRange } from '../lib/dday'
import { formatKRW, totalByCategory, totalOf } from '../lib/budget'
import { toMarkdown } from '../lib/markdown'
import { toHtml } from '../lib/html'
import { assetsByCategory, visualCategoryLabel } from '../lib/visuals'
import { groupedMeetingItems } from '../lib/meetingLogs'
import { formatTimelineTime, shootingTimelineTypeLabel, sortTimelineItems } from '../lib/shooting'
import { downloadHTML, downloadMarkdown } from '../storage'

export function PPMPreview({ state }: { state: AppState }) {
  const total = statsOf(state.checklist)
  const byCat = statsByCategory(state.checklist)
  const issues = detectIssues(state)
  const { project, documents, budget, crew, shootingDays } = state
  const shootRange = formatRange(project.shootStartDate, project.shootEndDate)
  const shootDays = daysBetween(project.shootStartDate, project.shootEndDate)
  const budgetTotal = totalOf(budget)
  const budgetByCat = totalByCategory(budget)
  const visualGroups = assetsByCategory(state.assets)
  const meetingGroups = groupedMeetingItems(state.meetingLogs)
  const hasMeetingArchive = state.meetingLogs.length > 0 || documents.meetingNotes.trim()

  const exportMd = () => downloadMarkdown(project.title || 'PPM', toMarkdown(state))
  const exportHtml = () => downloadHTML(project.title || 'PPM', toHtml(state))
  const printPPM = () => window.print()

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <p className="text-xs text-ink-400">회의용 PPM Book 미리보기입니다.</p>
        <div className="grid grid-cols-3 gap-2 sm:flex">
          <button
            onClick={printPPM}
            className="min-h-10 rounded border border-ink-700 px-3 py-1.5 text-xs font-semibold text-ink-100 hover:bg-ink-800"
          >
            인쇄/PDF
          </button>
          <button
            onClick={exportHtml}
            className="min-h-10 rounded border border-ink-700 px-3 py-1.5 text-xs font-semibold text-ink-100 hover:bg-ink-800"
          >
            HTML
          </button>
          <button
            onClick={exportMd}
            className="min-h-10 rounded border border-ink-300 bg-ink-100 px-3 py-1.5 text-xs font-semibold text-ink-900 hover:bg-white"
          >
            Markdown
          </button>
        </div>
      </div>

      <article className="ppm-print space-y-7 rounded-lg border border-ink-700 bg-ink-900 px-4 py-5 leading-relaxed sm:px-6 sm:py-7">
        <header>
          <h1 className="text-2xl font-bold text-ink-50">
            {project.title || '(프로젝트명 미입력)'}{' '}
            <span className="text-base font-normal text-ink-400">— PPM Book</span>
          </h1>
          <p className="mt-2 italic text-ink-300">
            “{project.logline || '(한 줄 소개 미입력)'}”
          </p>
        </header>

        <Section title="1. 프로젝트 개요">
          <dl className="grid grid-cols-1 gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
            <Row k="포맷" v={project.format} />
            <Row k="장르" v={project.genre} />
            <Row k="러닝타임" v={project.runtime > 0 ? `${project.runtime}분` : ''} />
            <Row k="촬영" v={shootRange} />
            <Row k="촬영 일수" v={shootDays !== null ? `${shootDays}일` : ''} />
            <Row k="제작 규모" v={project.productionScale} />
            <Row k="연출" v={project.director} />
            <Row k="프로듀서" v={project.producer} />
            <Row k="주요 로케이션" v={project.mainLocations.join(', ')} wide />
          </dl>
        </Section>

        <Section title="2. Staff List">
          {crew.length === 0 ? (
            <p className="text-sm text-ink-500">(스태프 미입력)</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] border-collapse text-sm">
                <thead>
                  <tr className="border-y border-ink-700 text-left text-xs text-ink-400">
                    <th className="py-2 pr-3 font-medium">역할</th>
                    <th className="py-2 pr-3 font-medium">이름 / 업체</th>
                    <th className="py-2 pr-3 font-medium">연락처</th>
                    <th className="py-2 font-medium">메모</th>
                  </tr>
                </thead>
                <tbody>
                  {crew.map((member) => (
                    <tr key={member.id} className="border-b border-ink-800">
                      <td className="py-2 pr-3 text-ink-300">{member.role || '-'}</td>
                      <td className="py-2 pr-3 text-ink-100">{member.name || '-'}</td>
                      <td className="py-2 pr-3 text-ink-300">{member.contact || '-'}</td>
                      <td className="py-2 text-ink-300">{member.note || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Section>

        <DocSection title="3. 기획의도" body={documents.intention} />
        <DocSection title="4. 연출 방향" body={documents.directing} />
        <DocSection title="5. 톤앤매너" body={documents.toneAndManner} />
        <DocSection title="6. 레퍼런스" body={documents.references} />
        <Section title="7. 비주얼 보드">
          {visualGroups.length === 0 ? (
            <p className="text-sm text-ink-500">(비주얼 자료 없음)</p>
          ) : (
            <div className="space-y-5">
              {visualGroups.map((group) => (
                <div key={group.key}>
                  <h3 className="mb-2 text-sm font-semibold text-ink-200">{group.label}</h3>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {group.assets.map((asset) => (
                      <figure
                        key={asset.id}
                        className="overflow-hidden rounded border border-ink-700"
                      >
                        <img
                          src={asset.dataUrl}
                          alt={asset.title || visualCategoryLabel(asset.category)}
                          className="aspect-[4/3] w-full object-cover"
                        />
                        <figcaption className="px-2.5 py-2">
                          <div className="text-xs font-semibold text-ink-100">
                            {asset.title || visualCategoryLabel(asset.category)}
                          </div>
                          {asset.note && (
                            <p className="mt-1 whitespace-pre-wrap text-[11px] leading-relaxed text-ink-400">
                              {asset.note}
                            </p>
                          )}
                        </figcaption>
                      </figure>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>
        <DocSection title="8. 시나리오 / 콘티" body={documents.storyboard} />
        <DocSection title="9. 제작 방향" body={documents.productionPlan} />
        <DocSection title="10. 촬영 전략" body={documents.shootingStrategy} />
        <DocSection title="11. 캐스팅 / 스타일링" body={documents.castingStyling} />
        <DocSection title="12. 미술 / 의상" body={documents.artCostume} />
        <DocSection title="13. 로케이션 노트" body={documents.locationNote} />
        <DocSection title="14. 소품 / 장비" body={documents.propsEquipment} />
        <DocSection title="15. 촬영 운영표" body={documents.schedulePlan} />

        <Section title="16. 일일촬영 계획표">
          {shootingDays.length === 0 ? (
            <p className="text-sm text-ink-500">(일촬표 미입력)</p>
          ) : (
            <div className="space-y-5">
              {shootingDays.map((day) => (
                <div key={day.id} className="rounded border border-ink-700 px-3 py-3">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="text-sm font-semibold text-ink-100">
                      {day.title || '회차'} {day.date && <span className="text-ink-400">· {day.date}</span>}
                    </h3>
                    <span className="text-xs text-ink-500">
                      씬 {day.scenes.length} · 시간표 {day.timeline.length}
                    </span>
                  </div>
                  <dl className="mt-2 grid gap-x-4 gap-y-1 text-xs sm:grid-cols-2">
                    <Row k="날씨" v={[day.weather, day.lowTemp, day.highTemp, day.rainChance].filter(Boolean).join(' / ')} />
                    <Row k="일출/일몰" v={[day.sunrise, day.sunset].filter(Boolean).join(' / ')} />
                    <Row k="콜타임" v={day.callTime} />
                    <Row k="종료/복귀" v={day.wrapTime} />
                    <Row k="베이스" v={day.basecamp} wide />
                  </dl>
                  {day.scenes.length > 0 && (
                    <div className="mt-3 space-y-1">
                      {day.scenes.map((scene) => (
                        <div key={scene.id} className="text-xs text-ink-200">
                          <span className="font-semibold">S#{scene.sceneNo || '-'}</span>
                          <span className="text-ink-500"> · {scene.time || '시간 미정'}</span>
                          <span className="text-ink-500"> · {scene.location || '장소 미정'}</span>
                          {scene.description && <span> — {scene.description}</span>}
                        </div>
                      ))}
                    </div>
                  )}
                  {day.timeline.length > 0 && (
                    <div className="mt-3 grid gap-1 text-xs">
                      {sortTimelineItems(day.timeline).map((item) => (
                        <div key={item.id} className="flex gap-2">
                          <span className="w-28 shrink-0 text-ink-500">
                            {formatTimelineTime(item)}
                          </span>
                          <span className="text-ink-200">
                            <span className="text-ink-500">
                              [{shootingTimelineTypeLabel(item.type)}]
                            </span>{' '}
                            {item.content || '-'}
                            {item.note && <span className="text-ink-500"> · {item.note}</span>}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  {day.notes && (
                    <p className="mt-3 whitespace-pre-wrap text-xs leading-relaxed text-ink-400">
                      {day.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </Section>

        <Section title="17. 예산 개요">
          {budget.length === 0 ? (
            <p className="text-sm text-ink-500">(예산 미입력)</p>
          ) : (
            <>
              <div className="mb-3 flex items-baseline gap-3">
                <span className="text-sm text-ink-400">총액</span>
                <span className="text-xl font-semibold tabular-nums text-ink-100">
                  {formatKRW(budgetTotal)}
                </span>
                <span className="text-xs text-ink-500">{budget.length}개 항목</span>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-4">
                {BUDGET_CATEGORIES.map((cat) => {
                  const v = budgetByCat[cat]
                  if (v === 0) return null
                  const pct = budgetTotal === 0 ? 0 : Math.round((v / budgetTotal) * 100)
                  return (
                    <div
                      key={cat}
                      className="rounded border border-ink-700 px-2.5 py-1.5"
                    >
                      <div className="flex items-baseline justify-between">
                        <span className="text-[11px] text-ink-400">{cat}</span>
                        <span className="text-[10px] tabular-nums text-ink-500">{pct}%</span>
                      </div>
                      <div className="text-sm font-medium tabular-nums text-ink-100">
                        {formatKRW(v)}
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </Section>

        <Section title="18. 프리프로덕션 진행 현황">
          <div className="mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm">
            <span className="text-ink-400">전체</span>
            <span className="text-lg font-semibold text-ink-100">{total.percent}%</span>
            <span className="text-xs text-ink-400">
              확정 {total.done} · 진행중 {total.progress} · 위험 {total.risk} · 미시작 {total.todo}
            </span>
          </div>
          <div className="space-y-3">
            {CATEGORIES.map((cat) => {
              const s = byCat[cat]
              if (s.total === 0) return null
              const items = state.checklist.filter(
                (i) => i.category === cat && i.status !== 'na',
              )
              return (
                <div key={cat} className="rounded border border-ink-700 px-3 py-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-ink-100">{cat}</span>
                    <span className="text-xs text-ink-400">
                      {s.done}/{s.total} · {s.percent}%
                    </span>
                  </div>
                  <ul className="mt-1.5 space-y-1 text-xs">
                    {items.map((it) => (
                      <li key={it.id} className="flex items-baseline gap-2">
                        <StatusBadge status={it.status} />
                        <span className="text-ink-100">{it.title || '(제목 없음)'}</span>
                        {it.note && (
                          <span className="text-ink-500">— {it.note}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </Section>

        <Section title="19. 미확정 / 위험 항목">
          {issues.length === 0 ? (
            <p className="text-sm text-ink-400">현재 감지된 이슈가 없습니다.</p>
          ) : (
            <ul className="space-y-1 text-sm">
              {issues.map((i, idx) => (
                <li key={idx} className="flex items-baseline gap-2">
                  <span
                    className={`mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full ${
                      i.level === 'critical' ? 'bg-red-400' : 'bg-amber-400'
                    }`}
                  />
                  <span>{i.message}</span>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section title="20. 회의 안건">
          <Multiline body={documents.meetingAgenda} />
        </Section>

        {hasMeetingArchive && (
          <Section title="21. 회의록 색인">
            {meetingGroups.length > 0 && (
              <div className="grid gap-3 sm:grid-cols-2">
                {meetingGroups.map((group) => (
                  <div key={group.category} className="rounded border border-ink-700 px-3 py-2">
                    <h3 className="text-sm font-semibold text-ink-100">{group.label}</h3>
                    <ul className="mt-2 space-y-1 text-xs text-ink-300">
                      {group.items.map((item) => (
                        <li key={`${item.log.id}-${item.id}`}>
                          <span className="text-ink-500">[{item.log.department}]</span>{' '}
                          {item.text}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
            {documents.meetingNotes.trim() && (
              <div className="mt-3">
                <Multiline body={documents.meetingNotes} />
              </div>
            )}
          </Section>
        )}

        {documents.riskMemo.trim() && (
          <Section title={hasMeetingArchive ? '22. 리스크 메모' : '21. 리스크 메모'}>
            <Multiline body={documents.riskMemo} />
          </Section>
        )}
      </article>
    </div>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 text-base font-semibold text-ink-50">{title}</h2>
      <div className="text-ink-100">{children}</div>
    </section>
  )
}

function DocSection({ title, body }: { title: string; body: string }) {
  return (
    <Section title={title}>
      {body.trim() ? (
        <Multiline body={body} />
      ) : (
        <p className="text-sm text-ink-500">(미입력)</p>
      )}
    </Section>
  )
}

function Multiline({ body }: { body: string }) {
  return (
    <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink-100">{body}</p>
  )
}

function Row({ k, v, wide }: { k: string; v: string; wide?: boolean }) {
  return (
    <div className={wide ? 'flex gap-2 sm:col-span-2' : 'flex gap-2'}>
      <dt className="w-24 shrink-0 text-ink-400">{k}</dt>
      <dd className="text-ink-100">{v || '-'}</dd>
    </div>
  )
}
