import { useRef } from 'react'
import type { ThemeMode } from '../App'
import { AppState } from '../types'
import { downloadJSON, readJSONFile } from '../storage'

interface Props {
  state: AppState
  theme: ThemeMode
  onThemeChange: (theme: ThemeMode) => void
  onImport: (s: AppState) => void
  onReset: () => void
}

const THEMES: { key: ThemeMode; label: string }[] = [
  { key: 'white', label: '화이트' },
  { key: 'gray', label: '그레이' },
  { key: 'black', label: '블랙' },
]

export function TopBar({ state, theme, onThemeChange, onImport, onReset }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const updated = new Date(state.updatedAt).toLocaleString('ko-KR', {
    dateStyle: 'short',
    timeStyle: 'short',
  })

  return (
    <header className="flex flex-col gap-3 border-b border-ink-700 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
      <div className="flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-1">
        <h1 className="whitespace-nowrap text-base font-semibold tracking-tight text-ink-100">
          프리프로덕션 에이전트
        </h1>
        <span className="truncate text-xs text-ink-300">
          {state.project.title || '제목 없음'}
        </span>
        <span className="whitespace-nowrap text-[11px] text-ink-500">· 저장 {updated}</span>
      </div>
      <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
        <div className="grid grid-cols-3 rounded border border-ink-700 bg-ink-800/60 p-0.5">
          {THEMES.map((t) => {
            const active = theme === t.key
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => onThemeChange(t.key)}
                className={`min-h-9 whitespace-nowrap rounded px-2 text-[11px] font-medium transition-colors ${
                  active
                    ? 'bg-ink-100 text-ink-900'
                    : 'text-ink-300 hover:bg-ink-700 hover:text-ink-100'
                }`}
              >
                {t.label}
              </button>
            )
          })}
        </div>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => downloadJSON(state)}
            className="min-h-10 whitespace-nowrap rounded border border-ink-700 px-2.5 py-1 text-xs text-ink-200 hover:bg-ink-700"
          >
            저장본
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className="min-h-10 whitespace-nowrap rounded border border-ink-700 px-2.5 py-1 text-xs text-ink-200 hover:bg-ink-700"
          >
            불러오기
          </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0]
            if (!file) return
            try {
              const next = await readJSONFile(file)
              onImport({ ...next, updatedAt: new Date().toISOString() })
            } catch (err) {
              alert((err as Error).message)
            } finally {
              e.target.value = ''
            }
          }}
        />
          <button
            onClick={() => {
              if (confirm('빈 템플릿 상태로 초기화합니다. 진행할까요?')) onReset()
            }}
            className="min-h-10 whitespace-nowrap rounded border border-ink-700 px-2.5 py-1 text-xs text-ink-300 hover:bg-ink-700"
          >
            초기화
          </button>
        </div>
      </div>
    </header>
  )
}
