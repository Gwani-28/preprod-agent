import { ChecklistCategory, ChecklistItem } from '../types'

// 포맷별 프리셋: 공통 체크리스트(seed) 위에 그 포맷 특유의 준비 항목을 더한다.
// 기존 항목을 지우지 않고, 같은 (카테고리|제목)이 없을 때만 추가한다.
export interface FormatPreset {
  key: string
  /** 버튼에 보이는 이름 */
  name: string
  /** project.format 에 채워질 값 */
  format: string
  /** 한 줄 설명 */
  hint: string
  /** 이 포맷 특유의 체크리스트 항목 */
  items: { category: ChecklistCategory; title: string }[]
}

export const PRESETS: FormatPreset[] = [
  {
    key: 'short',
    name: '단편영화',
    format: '단편영화',
    hint: '내러티브 중심 · 연출/미술/사운드',
    items: [
      { category: '시나리오', title: '트리트먼트 / 시놉시스 확정' },
      { category: '시나리오', title: '대사 / 지문 최종고 정리' },
      { category: '캐스팅', title: '오디션 / 리딩 일정 확인' },
      { category: '데이터/후반', title: '색보정 / 사운드 믹싱 담당 확인' },
    ],
  },
  {
    key: 'ad',
    name: '광고',
    format: '광고',
    hint: '대행사·클라이언트 승인 · 매체/2차 사용',
    items: [
      { category: '기획', title: '오리엔테이션(OT) / 브리프 정리' },
      { category: '기획', title: '대행사 / 클라이언트 승인 라인 확정' },
      { category: '스태프/계약', title: '대행사·클라이언트 커뮤니케이션 창구 정리' },
      { category: '시나리오', title: '스토리보드 / 콘티 클라이언트 컨펌' },
      { category: '캐스팅', title: '모델 초상권 / 사용범위 / 재계약 조건 확인' },
      { category: '로케이션', title: 'PPL / 브랜드 노출 조건 확인' },
      { category: '제작/예산', title: '견적서(대행사 제출용) 작성' },
      { category: '제작/예산', title: '사용 매체 / 기간 / 2차 사용료 확인' },
      { category: '데이터/후반', title: '클라이언트 검수 / 수정 라운드 일정 확인' },
      { category: '데이터/후반', title: '납품본(매체별 규격) 리스트 작성' },
      { category: '안전/허가', title: '제품 / 소품 협찬 관리' },
    ],
  },
  {
    key: 'mv',
    name: '뮤직비디오',
    format: '뮤직비디오',
    hint: '아티스트·레이블 · 퍼포먼스/플레이백',
    items: [
      { category: '기획', title: '레이블 / 아티스트 콘셉트 미팅' },
      { category: '기획', title: '콘셉트 트리트먼트 확정' },
      { category: '시나리오', title: '곡 구성(벌스/훅) 대비 씬 매핑' },
      { category: '시나리오', title: '퍼포먼스 / 안무 구성 확인' },
      { category: '캐스팅', title: '아티스트 스케줄 확정' },
      { category: '캐스팅', title: '안무팀 / 백댄서 섭외' },
      { category: '미술/의상', title: '아티스트 의상 / 스타일 팀 조율' },
      { category: '촬영/조명', title: '플레이백 음원 / 스피커 준비' },
      { category: '촬영/조명', title: '퍼포먼스 컷 / 립싱크 계획' },
      { category: '사운드', title: '플레이백 재생 / 싱크 방식 확인' },
      { category: '데이터/후반', title: '편집 리듬(음악 싱크) 기준 정리' },
      { category: '데이터/후반', title: '레이블 검수 / 공개일 기준 마감 확인' },
    ],
  },
]

// applyPreset: 기존 checklist에 프리셋 항목 중 없는 것만 골라 붙인 새 배열을 만든다.
export function mergePresetItems(
  existing: ChecklistItem[],
  preset: FormatPreset,
): ChecklistItem[] {
  const seen = new Set(existing.map((i) => `${i.category}|${i.title}`))
  const added: ChecklistItem[] = preset.items
    .filter((it) => !seen.has(`${it.category}|${it.title}`))
    .map((it, idx) => ({
      id: `preset-${preset.key}-${idx}`,
      category: it.category,
      title: it.title,
      status: 'todo',
      note: '',
    }))
  return [...existing, ...added]
}
