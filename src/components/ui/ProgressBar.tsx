export function ProgressBar({
  percent,
  tone = 'neutral',
}: {
  percent: number
  tone?: 'neutral' | 'risk'
}) {
  const color = tone === 'risk' ? 'bg-red-400/80' : 'bg-emerald-400/80'
  const value = Math.min(100, Math.max(0, percent))
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink-700">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
    </div>
  )
}
