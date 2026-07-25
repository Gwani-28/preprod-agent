import { useEffect, useMemo, useState } from 'react'
import {
  AppState,
  BudgetItem,
  ChecklistItem,
  CrewMember,
  DocumentSections,
  MeetingLog,
  ProjectInfo,
  ShootingDay,
  TabKey,
  VisualAsset,
} from './types'
import { clear, load, save } from './storage'
import { SEED } from './seed'
import { FormatPreset, mergePresetItems } from './lib/presets'
import { TabNav } from './components/TabNav'
import { TopBar } from './components/TopBar'
import { Dashboard } from './tabs/Dashboard'
import { Crew } from './tabs/Crew'
import { Checklist } from './tabs/Checklist'
import { Budget } from './tabs/Budget'
import { Documents } from './tabs/Documents'
import { ShootingPlan } from './tabs/ShootingPlan'
import { VisualBoard } from './tabs/VisualBoard'
import { MissingCheck } from './tabs/MissingCheck'
import { PPMPreview } from './tabs/PPMPreview'
import { detectIssues } from './lib/missingCheck'

export type ThemeMode = 'white' | 'gray' | 'black'

const THEME_KEY = 'preprod-agent:theme'

const loadTheme = (): ThemeMode => {
  if (typeof localStorage === 'undefined') return 'black'
  const saved = localStorage.getItem(THEME_KEY)
  return saved === 'white' || saved === 'gray' || saved === 'black' ? saved : 'black'
}

export default function App() {
  const [state, setState] = useState<AppState>(() => load())
  const [tab, setTab] = useState<TabKey>('dashboard')
  const [theme, setTheme] = useState<ThemeMode>(() => loadTheme())

  useEffect(() => {
    save(state)
  }, [state])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try {
      localStorage.setItem(THEME_KEY, theme)
    } catch {
      // 테마 저장 실패해도 앱은 계속 동작
    }
  }, [theme])

  const stamp = <T extends Partial<AppState>>(patch: T) => ({
    ...patch,
    updatedAt: new Date().toISOString(),
  })

  const setProject = (project: ProjectInfo) =>
    setState((s) => ({ ...s, ...stamp({ project }) }))
  const setCrew = (crew: CrewMember[]) =>
    setState((s) => ({ ...s, ...stamp({ crew }) }))
  const setChecklist = (checklist: ChecklistItem[]) =>
    setState((s) => ({ ...s, ...stamp({ checklist }) }))
  const setBudget = (budget: BudgetItem[]) =>
    setState((s) => ({ ...s, ...stamp({ budget }) }))
  const setDocs = (documents: DocumentSections) =>
    setState((s) => ({ ...s, ...stamp({ documents }) }))
  const setMeetingLogs = (meetingLogs: MeetingLog[]) =>
    setState((s) => ({ ...s, ...stamp({ meetingLogs }) }))
  const setShootingDays = (shootingDays: ShootingDay[]) =>
    setState((s) => ({ ...s, ...stamp({ shootingDays }) }))
  const setAssets = (assets: VisualAsset[]) =>
    setState((s) => ({ ...s, ...stamp({ assets }) }))

  const applyPreset = (preset: FormatPreset) =>
    setState((s) =>
      stamp({
        ...s,
        project: { ...s.project, format: preset.format },
        checklist: mergePresetItems(s.checklist, preset),
      }),
    )

  const handleImport = (next: AppState) => setState(next)
  const handleReset = () => {
    clear()
    setState({ ...SEED, updatedAt: new Date().toISOString() })
    setTab('dashboard')
  }

  const issues = useMemo(() => detectIssues(state), [state])
  const criticalCount = issues.filter((i) => i.level === 'critical').length

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col">
      <TopBar
        state={state}
        theme={theme}
        onThemeChange={setTheme}
        onImport={handleImport}
        onReset={handleReset}
      />
      <TabNav active={tab} onChange={setTab} counts={{ missing: criticalCount }} />
      <main className="flex-1 px-3 py-4 sm:px-4 sm:py-6">
        {tab === 'dashboard' && (
          <Dashboard
            state={state}
            setProject={setProject}
            goto={setTab}
            applyPreset={applyPreset}
          />
        )}
        {tab === 'crew' && <Crew crew={state.crew} setCrew={setCrew} />}
        {tab === 'checklist' && (
          <Checklist state={state} setChecklist={setChecklist} />
        )}
        {tab === 'budget' && <Budget state={state} setBudget={setBudget} />}
        {tab === 'documents' && (
          <Documents state={state} setDocs={setDocs} setMeetingLogs={setMeetingLogs} />
        )}
        {tab === 'shooting' && (
          <ShootingPlan
            days={state.shootingDays}
            setDays={setShootingDays}
            projectTitle={state.project.title}
          />
        )}
        {tab === 'visuals' && <VisualBoard state={state} setAssets={setAssets} />}
        {tab === 'missing' && <MissingCheck state={state} goto={setTab} />}
        {tab === 'preview' && <PPMPreview state={state} />}
      </main>
      <footer className="border-t border-ink-700 px-3 py-3 text-[11px] text-ink-500 sm:px-4">
        프리프로덕션 에이전트 · 모든 데이터는 브라우저 localStorage에 저장됩니다.
      </footer>
    </div>
  )
}
