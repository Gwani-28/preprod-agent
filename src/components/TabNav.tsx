import { TabKey } from '../types'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'dashboard', label: '홈' },
  { key: 'crew', label: '스태프' },
  { key: 'checklist', label: '체크' },
  { key: 'budget', label: '예산' },
  { key: 'documents', label: '문서' },
  { key: 'shooting', label: '일촬' },
  { key: 'visuals', label: '비주얼' },
  { key: 'missing', label: '누락' },
  { key: 'preview', label: 'PPM' },
]

export function TabNav({
  active,
  onChange,
  counts,
}: {
  active: TabKey
  onChange: (k: TabKey) => void
  counts?: Partial<Record<TabKey, number>>
}) {
  return (
    <nav className="sticky top-0 z-10 flex snap-x items-center gap-1 overflow-x-auto border-b border-ink-700 bg-ink-900/95 px-3 backdrop-blur sm:px-4">
      {TABS.map((t) => {
        const isActive = active === t.key
        const count = counts?.[t.key]
        return (
          <button
            key={t.key}
            aria-current={isActive ? 'page' : undefined}
            onClick={() => onChange(t.key)}
            className={`relative -mb-px min-h-11 shrink-0 snap-start whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ${
              isActive
                ? 'border-ink-100 text-ink-100'
                : 'border-transparent text-ink-400 hover:text-ink-200'
            }`}
          >
            {t.label}
            {typeof count === 'number' && count > 0 && (
              <span className="ml-1.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500/80 px-1 text-[10px] font-semibold text-white">
                {count}
              </span>
            )}
          </button>
        )
      })}
    </nav>
  )
}
