import {
  AppState,
  BudgetItem,
  CrewMember,
  MeetingLog,
  ShootingDay,
  VisualAsset,
} from './types'
import { SEED } from './seed'
import { makeMeetingLog } from './lib/meetingLogs'
import { normalizeShootingDay } from './lib/shooting'

const KEY = 'preprod-agent:v3'
const LEGACY_KEYS = ['preprod-agent:v1', 'preprod-agent:v2']

// 구버전 JSON을 현재 모델로 변환한다. 누락 필드 보강 + 타입 변환.
function migrate(s: AppState, sourceKey = KEY): AppState {
  const project = { ...s.project } as Record<string, unknown>

  if (typeof project.shootStartDate !== 'string') project.shootStartDate = ''
  if (typeof project.shootEndDate !== 'string') project.shootEndDate = ''

  // runtime: string("15분") → number(15)
  if (typeof project.runtime === 'string') {
    const n = parseInt(project.runtime as string, 10)
    project.runtime = Number.isFinite(n) ? n : 0
  } else if (typeof project.runtime !== 'number') {
    project.runtime = 0
  }

  // mainLocations: 콤마 구분 문자열 → 배열
  if (typeof project.mainLocations === 'string') {
    project.mainLocations = (project.mainLocations as string)
      .split(',')
      .map((x) => x.trim())
      .filter(Boolean)
  } else if (!Array.isArray(project.mainLocations)) {
    project.mainLocations = []
  }

  // 사용 중단 필드 제거
  delete project.shootDates
  delete project.shootDays

  const documents = {
    ...SEED.documents,
    ...((s as unknown as { documents?: unknown }).documents ?? {}),
  } as AppState['documents']

  const budget: BudgetItem[] = Array.isArray((s as unknown as { budget?: unknown }).budget)
    ? ((s as unknown as { budget: BudgetItem[] }).budget)
    : []

  const fallbackCrew: CrewMember[] = [
    {
      id: 'crew-director',
      role: '연출',
      name: String(project.director ?? ''),
      contact: '',
      note: '',
    },
    {
      id: 'crew-producer',
      role: '프로듀서',
      name: String(project.producer ?? ''),
      contact: '',
      note: '',
    },
  ].filter((member) => member.name.trim())

  const crew: CrewMember[] = Array.isArray((s as unknown as { crew?: unknown }).crew)
    ? ((s as unknown as { crew: CrewMember[] }).crew)
    : fallbackCrew

  const assets: VisualAsset[] = Array.isArray((s as unknown as { assets?: unknown }).assets)
    ? ((s as unknown as { assets: VisualAsset[] }).assets)
    : []

  const legacyMeetingNotes = documents.meetingNotes.trim()
  const meetingLogs: MeetingLog[] = Array.isArray(
    (s as unknown as { meetingLogs?: unknown }).meetingLogs,
  )
    ? ((s as unknown as { meetingLogs: MeetingLog[] }).meetingLogs)
    : legacyMeetingNotes
      ? [
          makeMeetingLog({
            title: '기존 회의 메모',
            department: '전체',
            sourceName: 'meeting-notes',
            rawText: legacyMeetingNotes,
          }),
        ]
      : []
  if (
    legacyMeetingNotes &&
    !Array.isArray((s as unknown as { meetingLogs?: unknown }).meetingLogs)
  ) {
    documents.meetingNotes = ''
  }

  const shootingDays: ShootingDay[] = Array.isArray(
    (s as unknown as { shootingDays?: unknown }).shootingDays,
  )
    ? ((s as unknown as { shootingDays: ShootingDay[] }).shootingDays).map(
        normalizeShootingDay,
      )
    : []

  const next = {
    ...s,
    project: project as unknown as AppState['project'],
    crew,
    documents,
    meetingLogs,
    shootingDays,
    budget,
    assets,
  }

  return isLegacySample(next, sourceKey) ? { ...SEED, updatedAt: new Date().toISOString() } : next
}

function isLegacySample(state: AppState, sourceKey: string) {
  return (
    sourceKey !== KEY &&
    state.project.title === '여름의 끝' &&
    state.project.director === '김도연' &&
    state.project.producer === '이수민'
  )
}

export function load(): AppState {
  if (typeof localStorage === 'undefined') return SEED
  try {
    for (const key of [KEY, ...LEGACY_KEYS]) {
      const raw = localStorage.getItem(key)
      if (!raw) continue
      const parsed = JSON.parse(raw) as AppState
      if (!parsed || !parsed.project || !parsed.checklist || !parsed.documents) continue
      return migrate(parsed, key)
    }
    return SEED
  } catch {
    return SEED
  }
}

export function save(state: AppState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    // 저장 실패해도 앱은 계속 동작
  }
}

export function clear() {
  try {
    localStorage.removeItem(KEY)
    for (const legacyKey of LEGACY_KEYS) localStorage.removeItem(legacyKey)
  } catch {
    // ignore
  }
}

export function downloadJSON(state: AppState) {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${state.project.title || 'project'}-ppm.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function downloadMarkdown(filenameBase: string, md: string) {
  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filenameBase || 'PPM'}.md`
  a.click()
  URL.revokeObjectURL(url)
}

export function downloadHTML(filenameBase: string, html: string) {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filenameBase || 'PPM'}.html`
  a.click()
  URL.revokeObjectURL(url)
}

export async function readJSONFile(file: File): Promise<AppState> {
  const text = await file.text()
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new Error('JSON 파싱에 실패했습니다.')
  }
  const s = parsed as AppState
  if (!s || !s.project || !Array.isArray(s.checklist) || !s.documents) {
    throw new Error('유효하지 않은 PPM JSON 파일입니다.')
  }
  return migrate(s)
}
