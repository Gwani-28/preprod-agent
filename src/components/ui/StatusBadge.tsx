import { ChecklistStatus, STATUS_LABEL } from '../../types'

const COLOR: Record<ChecklistStatus, string> = {
  todo: 'bg-ink-700/80 text-ink-300 border-ink-600',
  progress: 'bg-amber-900/40 text-amber-200 border-amber-800/60',
  done: 'bg-emerald-900/40 text-emerald-200 border-emerald-800/60',
  risk: 'bg-red-900/40 text-red-200 border-red-800/60',
  na: 'bg-ink-800 text-ink-500 border-ink-700',
}

export function StatusBadge({ status }: { status: ChecklistStatus }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded border px-1.5 py-0.5 text-[11px] font-medium ${COLOR[status]}`}
    >
      {STATUS_LABEL[status]}
    </span>
  )
}
