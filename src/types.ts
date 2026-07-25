export type ChecklistStatus = 'todo' | 'progress' | 'done' | 'risk' | 'na'

export const STATUS_LABEL: Record<ChecklistStatus, string> = {
  todo: '미시작',
  progress: '진행중',
  done: '확정',
  risk: '위험',
  na: '불필요',
}

export const STATUSES: ChecklistStatus[] = ['todo', 'progress', 'done', 'risk', 'na']

export type ChecklistCategory =
  | '기획'
  | '스태프/계약'
  | '시나리오'
  | '캐스팅'
  | '로케이션'
  | '미술/의상'
  | '촬영/조명'
  | '사운드'
  | '제작/예산'
  | '스케줄'
  | '데이터/후반'
  | '안전/허가'

export const CATEGORIES: ChecklistCategory[] = [
  '기획',
  '스태프/계약',
  '시나리오',
  '캐스팅',
  '로케이션',
  '미술/의상',
  '촬영/조명',
  '사운드',
  '제작/예산',
  '스케줄',
  '데이터/후반',
  '안전/허가',
]

export interface ProjectInfo {
  title: string
  format: string
  genre: string
  runtime: number // 분 단위 (0 = 미입력)
  logline: string
  shootStartDate: string // "YYYY-MM-DD"
  shootEndDate: string // "YYYY-MM-DD"
  mainLocations: string[] // 태그 배열
  productionScale: string
  director: string
  producer: string
}

export interface ChecklistItem {
  id: string
  category: ChecklistCategory
  title: string
  status: ChecklistStatus
  note: string
}

export interface CrewMember {
  id: string
  role: string
  name: string
  contact: string
  note: string
}

export interface DocumentSections {
  intention: string
  directing: string
  toneAndManner: string
  references: string
  storyboard: string
  productionPlan: string
  shootingStrategy: string
  castingStyling: string
  artCostume: string
  locationNote: string
  propsEquipment: string
  schedulePlan: string
  meetingNotes: string
  riskMemo: string
  meetingAgenda: string
}

export type BudgetCategory =
  | '인건비'
  | '식대'
  | '교통/숙박'
  | '장비 렌탈'
  | '로케이션'
  | '미술/의상'
  | '후반'
  | '예비비'

export const BUDGET_CATEGORIES: BudgetCategory[] = [
  '인건비',
  '식대',
  '교통/숙박',
  '장비 렌탈',
  '로케이션',
  '미술/의상',
  '후반',
  '예비비',
]

export interface BudgetItem {
  id: string
  category: BudgetCategory
  item: string
  planned: number // 원 단위
  note: string
}

export type VisualAssetCategory =
  | 'mood'
  | 'storyboard'
  | 'location'
  | 'casting'
  | 'art'
  | 'equipment'

export const VISUAL_ASSET_CATEGORIES: {
  key: VisualAssetCategory
  label: string
}[] = [
  { key: 'mood', label: '무드' },
  { key: 'storyboard', label: '콘티' },
  { key: 'location', label: '로케이션' },
  { key: 'casting', label: '캐스팅' },
  { key: 'art', label: '미술/소품' },
  { key: 'equipment', label: '장비' },
]

export interface VisualAsset {
  id: string
  category: VisualAssetCategory
  title: string
  note: string
  dataUrl: string
}

export type MeetingItemCategory = 'decision' | 'action' | 'open' | 'risk' | 'reference' | 'general'

export interface MeetingLogItem {
  id: string
  category: MeetingItemCategory
  text: string
}

export interface MeetingLog {
  id: string
  title: string
  department: string
  sourceName: string
  createdAt: string
  rawText: string
  items: MeetingLogItem[]
}

export interface ShootingScene {
  id: string
  sceneNo: string
  location: string
  sol: string
  dayNight: string
  inOut: string
  time: string
  cutCount: number
  description: string
  cast: string
}

export type ShootingTimelineType =
  | 'call'
  | 'move'
  | 'setup'
  | 'hmu'
  | 'rehearsal'
  | 'shoot'
  | 'meal'
  | 'wrap'
  | 'etc'

export interface ShootingTimelineItem {
  id: string
  time: string
  startTime: string
  endTime: string
  type: ShootingTimelineType
  content: string
  note: string
}

export type ShootingInfoType = 'staff' | 'cast' | 'location' | 'meal' | 'notice'

export interface ShootingInfoItem {
  id: string
  type: ShootingInfoType
  label: string
  name: string
  contact: string
  note: string
}

export interface ShootingDay {
  id: string
  title: string
  date: string
  weather: string
  lowTemp: string
  highTemp: string
  rainChance: string
  sunrise: string
  sunset: string
  callTime: string
  wrapTime: string
  basecamp: string
  notes: string
  scenes: ShootingScene[]
  timeline: ShootingTimelineItem[]
  info: ShootingInfoItem[]
}

export interface AppState {
  project: ProjectInfo
  crew: CrewMember[]
  checklist: ChecklistItem[]
  documents: DocumentSections
  meetingLogs: MeetingLog[]
  shootingDays: ShootingDay[]
  budget: BudgetItem[]
  assets: VisualAsset[]
  updatedAt: string
}

export type TabKey =
  | 'dashboard'
  | 'crew'
  | 'checklist'
  | 'budget'
  | 'documents'
  | 'shooting'
  | 'visuals'
  | 'missing'
  | 'preview'
