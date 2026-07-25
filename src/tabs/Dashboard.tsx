import { ReactNode } from 'react'
import { AppState, CATEGORIES, ChecklistCategory, ProjectInfo, TabKey } from '../types'
import { Card } from '../components/ui/Card'
import { Field, TextArea, TextInput } from '../components/ui/Field'
import { ProgressBar } from '../components/ui/ProgressBar'
import { TagInput } from '../components/ui/TagInput'
import { statsByCategory, statsOf } from '../lib/progress'
import { detectIssues } from '../lib/missingCheck'
import { daysBetween, daysUntil, ddayLabel } from '../lib/dday'
import { formatKRW, totalOf } from '../lib/budget'

interface Props {
  state: AppState
  setProject: (p: ProjectInfo) => void
  goto: (tab: TabKey) => void
}

export function Dashboard({ state, setProject, goto }: Props) {
  const stats = statsOf(state.checklist)
  const byCat = statsByCategory(state.checklist)
  const issues = detectIssues(state)
  const critical = issues.filter((i) => i.level === 'critical').length
  const warnings = issues.filter((i) => i.level === 'warning').length
  const dday = daysUntil(state.project.shootStartDate)
  const shootDays = daysBetween(state.project.shootStartDate, state.project.shootEndDate)
  const budgetTotal = totalOf(state.budget)
  const crewCount = state.crew.filter((member) => member.role.trim() || member.name.trim()).length
  const callSheetCount = state.shootingDays.length
  const docValues = Object.entries(state.documents)
    .filter(([key]) => key !== 'meetingNotes')
    .map(([, value]) => value)
  const docsDone = docValues.filter((v) => v.trim()).length
  const docsPercent = Math.round((docsDone / docValues.length) * 100)
  const agendaLines = state.documents.meetingAgenda
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 5)
  const budgetPercent = budgetTotal > 0 ? 100 : 0
  const crewPercent = crewCount >= 2 ? 100 : crewCount * 50
  const callSheetPercent = callSheetCount > 0 ? 100 : 0
  const visualPercent = state.assets.length > 0 ? 100 : 0
  const issuePercent = critical === 0 ? 100 : Math.max(0, 100 - critical * 25)
  const ppmScore = Math.round(
    stats.percent * 0.3 +
      docsPercent * 0.25 +
      budgetPercent * 0.15 +
      crewPercent * 0.1 +
      callSheetPercent * 0.05 +
      visualPercent * 0.05 +
      issuePercent * 0.1,
  )
  const categoryRows = CATEGORIES.map((cat) => {
    const s = byCat[cat]
    const next = state.checklist.find(
      (i) => i.category === cat && i.status !== 'done' && i.status !== 'na',
    )
    return {
      cat,
      done: s.done,
      total: s.total,
      percent: s.percent,
      risk: s.risk,
      next: next?.title,
    }
  })
  const focusIssues = issues.slice(0, 5)

  const overviewReady = Boolean(
    state.project.title.trim() &&
      state.project.logline.trim() &&
      state.project.shootStartDate &&
      state.project.shootEndDate,
  )
  const pipeline = [
    { label: '개요', ready: overviewReady },
    { label: '스태프', ready: crewCount >= 2 },
    { label: '문서', ready: docsPercent >= 70 },
    { label: '일촬', ready: callSheetCount > 0 },
    { label: '비주얼', ready: state.assets.length > 0 },
    { label: '예산', ready: budgetTotal > 0 },
    { label: '리스크', ready: critical === 0 },
    { label: 'PPM', ready: ppmScore >= 80 },
  ]

  const update = <K extends keyof ProjectInfo>(k: K, v: ProjectInfo[K]) =>
    setProject({ ...state.project, [k]: v })

  const ddayColor =
    dday === null
      ? 'text-ink-500'
      : dday < 0
        ? 'text-ink-400'
        : dday <= 7
          ? 'text-red-300'
          : dday <= 30
            ? 'text-amber-300'
            : 'text-ink-100'

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 rounded-lg border border-ink-700 bg-ink-800/40 px-3 py-3 sm:flex-row sm:items-baseline sm:justify-between sm:px-4">
        <div className="text-sm">
          <span className="text-[11px] uppercase tracking-wide text-ink-400">촬영</span>
          <span className="ml-2 text-ink-200">
            {state.project.shootStartDate || <span className="text-ink-500">미입력</span>}
            {state.project.shootEndDate && (
              <span className="text-ink-400"> ~ {state.project.shootEndDate}</span>
            )}
            {shootDays !== null && (
              <span className="ml-2 text-[11px] text-ink-500">({shootDays}일)</span>
            )}
          </span>
        </div>
        <div className={`text-3xl font-bold tabular-nums sm:text-right ${ddayColor}`}>
          {ddayLabel(dday)}
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-[0.9fr_1.1fr]">
        <Card title="PPM 준비도" description="체크리스트, 문서, 예산, 누락을 종합한 현재 점수입니다.">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div
              className="grid h-28 w-28 shrink-0 place-items-center rounded-full"
              style={{
                background: `conic-gradient(rgb(52 211 153) ${ppmScore * 3.6}deg, rgb(var(--ink-700) / 1) 0deg)`,
              }}
            >
              <div className="grid h-[5.5rem] w-[5.5rem] place-items-center rounded-full bg-ink-900">
                <div className="text-center">
                  <div className="text-2xl font-bold tabular-nums text-ink-50">{ppmScore}%</div>
                  <div className="text-[10px] text-ink-400">ready</div>
                </div>
              </div>
            </div>
            <dl className="grid flex-1 grid-cols-2 gap-2 text-sm">
              <Metric label="문서" value={`${docsDone}/${docValues.length}`} />
              <Metric label="스태프" value={crewCount} />
              <Metric label="일촬" value={callSheetCount} />
              <Metric label="비주얼" value={state.assets.length} />
              <Metric label="예산" value={formatKRW(budgetTotal)} />
              <Metric label="누락" value={critical} tone={critical > 0 ? 'risk' : 'ok'} />
              <Metric label="주의" value={warnings} tone={warnings > 0 ? 'warn' : 'ok'} />
            </dl>
          </div>
        </Card>

        <Card title="제작 흐름" description="현재 정보가 최종 PPM으로 넘어가는 단계입니다.">
          <div className="grid gap-2 sm:grid-cols-3 xl:grid-cols-4">
            {pipeline.map((step, idx) => (
              <div
                key={step.label}
                className={`rounded border px-3 py-2 ${
                  step.ready
                    ? 'border-emerald-400/40 bg-emerald-400/10'
                    : 'border-ink-700 bg-ink-900/30'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-semibold ${
                      step.ready
                        ? 'bg-emerald-400 text-ink-900'
                        : 'bg-ink-700 text-ink-300'
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <span className="whitespace-nowrap text-sm font-medium text-ink-100">{step.label}</span>
                </div>
                <div className="mt-1 whitespace-nowrap text-[11px] text-ink-400">
                  {step.ready ? '정리됨' : '정리 필요'}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4 xl:grid-cols-8">
        <StatCard
          label="전체 진행률"
          value={`${stats.percent}%`}
          sub={<ProgressBar percent={stats.percent} />}
        />
        <StatCard label="확정" value={stats.done} tone="ok" />
        <StatCard label="진행중" value={stats.progress} tone="warn" />
        <StatCard label="스태프" value={crewCount} onClick={() => goto('crew')} />
        <StatCard label="일촬" value={callSheetCount} onClick={() => goto('shooting')} />
        <StatCard
          label="위험"
          value={stats.risk}
          tone="risk"
          onClick={stats.risk > 0 ? () => goto('checklist') : undefined}
        />
        <StatCard
          label="비주얼"
          value={state.assets.length}
          onClick={() => goto('visuals')}
        />
        <StatCard
          label="누락"
          value={critical}
          tone="risk"
          onClick={critical > 0 ? () => goto('missing') : undefined}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card
          title="회의 안건"
          description="문서 탭의 회의 안건이 여기에도 표시됩니다."
          actions={
            <button
              onClick={() => goto('documents')}
              className="whitespace-nowrap text-xs text-ink-300 underline-offset-4 hover:underline"
            >
              문서로 이동 →
            </button>
          }
        >
          {agendaLines.length === 0 ? (
            <p className="text-sm text-ink-400">
              아직 회의 안건이 없습니다. 문서 탭에서 직접 쓰거나 자동 초안을 만들 수 있습니다.
            </p>
          ) : (
            <ol className="space-y-2">
              {agendaLines.map((line, idx) => (
                <li
                  key={`${line}-${idx}`}
                  className="flex gap-2 rounded border border-ink-700 bg-ink-900/30 px-3 py-2 text-sm text-ink-100"
                >
                  <span className="shrink-0 text-xs tabular-nums text-ink-500">{idx + 1}</span>
                  <span className="min-w-0 whitespace-pre-wrap">{line.replace(/^\d+[).]\s*/, '')}</span>
                </li>
              ))}
            </ol>
          )}
        </Card>
        <Card
          title="오늘 볼 항목"
          description="누락과 위험을 먼저 정리합니다."
          actions={
            critical > 0 ? (
              <button
                onClick={() => goto('missing')}
                className="text-xs text-ink-300 underline-offset-4 hover:underline"
              >
                누락 확인 →
              </button>
            ) : undefined
          }
        >
          {focusIssues.length === 0 ? (
            <p className="text-sm text-ink-400">지금은 바로 처리할 누락/주의 항목이 없습니다.</p>
          ) : (
            <ul className="space-y-2">
              {focusIssues.map((issue, idx) => (
                <li
                  key={`${issue.message}-${idx}`}
                  className="rounded border border-ink-700 bg-ink-900/30 px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        issue.level === 'critical' ? 'bg-red-400' : 'bg-amber-400'
                      }`}
                    />
                    <span className="text-xs font-medium text-ink-400">
                      {issue.level === 'critical' ? '누락' : '주의'}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-ink-100">{issue.message}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <CategoryMap rows={categoryRows} />

      <Card title="프로젝트 개요" description="PPM 표지와 회의 자료의 기준 정보입니다.">
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="프로젝트명">
            <TextInput
              value={state.project.title}
              onChange={(e) => update('title', e.target.value)}
              placeholder="프로젝트 제목 / 브랜드 캠페인 / MV 제목"
            />
          </Field>
          <Field label="포맷">
            <TextInput
              value={state.project.format}
              onChange={(e) => update('format', e.target.value)}
              placeholder="단편영화 / 광고 / MV / 브랜디드 필름"
            />
          </Field>
          <Field label="장르 / 무드">
            <TextInput
              value={state.project.genre}
              onChange={(e) => update('genre', e.target.value)}
            />
          </Field>
          <Field label="러닝타임 / 분량">
            <div className="flex items-stretch gap-2">
              <input
                type="number"
                min={0}
                value={state.project.runtime || ''}
                onChange={(e) =>
                  update('runtime', Math.max(0, Number(e.target.value) || 0))
                }
                placeholder="15"
                className="min-h-11 w-full rounded border px-3 py-2 text-base tabular-nums sm:text-sm"
              />
              <span className="flex items-center text-sm text-ink-400">분</span>
            </div>
          </Field>
          <Field label="촬영 시작일" hint="D-day 계산 기준">
            <TextInput
              type="date"
              value={state.project.shootStartDate}
              onChange={(e) => update('shootStartDate', e.target.value)}
            />
          </Field>
          <Field
            label="촬영 종료일"
            hint={shootDays !== null ? `총 ${shootDays}일` : '시작일 ≤ 종료일'}
          >
            <TextInput
              type="date"
              value={state.project.shootEndDate}
              min={state.project.shootStartDate || undefined}
              onChange={(e) => update('shootEndDate', e.target.value)}
            />
          </Field>
          <Field label="연출">
            <TextInput
              value={state.project.director}
              onChange={(e) => update('director', e.target.value)}
            />
          </Field>
          <Field label="프로듀서">
            <TextInput
              value={state.project.producer}
              onChange={(e) => update('producer', e.target.value)}
            />
          </Field>
          <div className="md:col-span-2">
            <Field label="제작 규모">
              <TextInput
                value={state.project.productionScale}
                onChange={(e) => update('productionScale', e.target.value)}
                placeholder="학생 단편 (스태프 12명)"
              />
            </Field>
          </div>
          <div className="md:col-span-2">
            <Field label="주요 로케이션" hint="Enter 또는 쉼표로 추가">
              <TagInput
                value={state.project.mainLocations}
                onChange={(v) => update('mainLocations', v)}
                placeholder="로케이션 추가"
              />
            </Field>
          </div>
          <div className="md:col-span-2">
            <Field label="한 줄 소개" hint="프로젝트의 핵심 감정, 콘셉트, 목적을 한 줄로 요약합니다.">
              <TextArea
                rows={2}
                value={state.project.logline}
                onChange={(e) => update('logline', e.target.value)}
              />
            </Field>
          </div>
        </div>
      </Card>

    </div>
  )
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string
  value: string | number
  tone?: 'ok' | 'warn' | 'risk'
}) {
  const color =
    tone === 'ok'
      ? 'text-emerald-400'
      : tone === 'warn'
        ? 'text-amber-400'
        : tone === 'risk'
          ? 'text-red-400'
          : 'text-ink-100'
  return (
    <div className="rounded border border-ink-700 bg-ink-900/30 px-3 py-2">
      <dt className="whitespace-nowrap text-[11px] text-ink-400">{label}</dt>
      <dd className={`mt-0.5 truncate text-sm font-semibold tabular-nums ${color}`}>{value}</dd>
    </div>
  )
}

function CategoryMap({
  rows,
}: {
  rows: {
    cat: ChecklistCategory
    done: number
    total: number
    percent: number
    risk: number
    next?: string
  }[]
}) {
  return (
    <Card title="준비 카테고리 맵" description="어느 파트가 막혀 있는지 한눈에 봅니다.">
      <div className="grid gap-2 md:grid-cols-2">
        {rows.map((row) => (
          <div key={row.cat} className="rounded border border-ink-700 bg-ink-900/30 px-3 py-2">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-medium text-ink-100">{row.cat}</span>
                  {row.risk > 0 && (
                    <span className="rounded bg-red-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-red-400">
                      위험 {row.risk}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 truncate text-[11px] text-ink-400">
                  {row.next ? `다음: ${row.next}` : '완료 또는 해당 없음'}
                </p>
              </div>
              <span className="shrink-0 text-xs tabular-nums text-ink-400">
                {row.done}/{row.total}
              </span>
            </div>
            <div className="mt-2">
              <ProgressBar percent={row.percent} tone={row.risk > 0 ? 'risk' : 'neutral'} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

function StatCard({
  label,
  value,
  sub,
  tone,
  onClick,
}: {
  label: string
  value: string | number
  sub?: ReactNode
  tone?: 'ok' | 'warn' | 'risk'
  onClick?: () => void
}) {
  const color =
    tone === 'ok'
      ? 'text-emerald-300'
      : tone === 'warn'
        ? 'text-amber-300'
        : tone === 'risk'
          ? 'text-red-300'
          : 'text-ink-100'
  const interactive = !!onClick
  return (
    <button
      onClick={onClick}
      disabled={!interactive}
      className={`min-h-24 rounded-lg border border-ink-700 bg-ink-800/60 px-3 py-3 text-left transition-colors ${
        interactive ? 'hover:border-ink-500' : 'cursor-default'
      }`}
    >
      <div className="whitespace-nowrap text-[11px] uppercase tracking-wide text-ink-400">{label}</div>
      <div className={`mt-1 text-2xl font-semibold tabular-nums ${color}`}>{value}</div>
      {sub && <div className="mt-2">{sub}</div>}
    </button>
  )
}
