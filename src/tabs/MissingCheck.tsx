import { AppState, TabKey } from '../types'
import { Card } from '../components/ui/Card'
import { detectIssues } from '../lib/missingCheck'

interface Props {
  state: AppState
  goto: (tab: TabKey) => void
}

export function MissingCheck({ state, goto }: Props) {
  const issues = detectIssues(state)
  const critical = issues.filter((i) => i.level === 'critical')
  const warnings = issues.filter((i) => i.level === 'warning')

  return (
    <div className="space-y-4">
      <Card
        title={`누락 항목 (${critical.length})`}
        description="PPM 회의 전에 반드시 채워야 하는 항목입니다."
      >
        {critical.length === 0 ? (
          <p className="text-sm text-ink-400">누락 항목이 없습니다.</p>
        ) : (
          <ul className="divide-y divide-ink-700">
            {critical.map((i, idx) => (
              <li key={idx} className="flex items-center gap-3 py-2">
                <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-red-400" />
                <span className="text-sm text-ink-100">{i.message}</span>
                <button
                  onClick={() => goto(i.tab)}
                  className="ml-auto text-xs text-ink-300 underline-offset-4 hover:underline"
                >
                  이동 →
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card
        title={`주의 항목 (${warnings.length})`}
        description="확정은 아니지만 검토가 필요합니다."
      >
        {warnings.length === 0 ? (
          <p className="text-sm text-ink-400">주의 항목이 없습니다.</p>
        ) : (
          <ul className="divide-y divide-ink-700">
            {warnings.map((i, idx) => (
              <li key={idx} className="flex items-center gap-3 py-2">
                <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-amber-400" />
                <span className="text-sm text-ink-100">{i.message}</span>
                <button
                  onClick={() => goto(i.tab)}
                  className="ml-auto text-xs text-ink-300 underline-offset-4 hover:underline"
                >
                  이동 →
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
