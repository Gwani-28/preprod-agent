import { PropsWithChildren, ReactNode } from 'react'

interface Props {
  title?: ReactNode
  description?: ReactNode
  actions?: ReactNode
  className?: string
}

export function Card({
  title,
  description,
  actions,
  className = '',
  children,
}: PropsWithChildren<Props>) {
  return (
    <section className={`rounded-lg border border-ink-700 bg-ink-800/60 ${className}`}>
      {(title || actions) && (
        <header className="flex flex-col gap-3 border-b border-ink-700 px-3 py-3 sm:flex-row sm:items-start sm:justify-between sm:px-4">
          <div className="min-w-0">
            {title && (
              <h2 className="text-sm font-semibold tracking-tight text-ink-100">{title}</h2>
            )}
            {description && <p className="mt-0.5 text-xs text-ink-400">{description}</p>}
          </div>
          {actions && (
            <div className="flex w-full shrink-0 flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
              {actions}
            </div>
          )}
        </header>
      )}
      <div className="p-3 sm:p-4">{children}</div>
    </section>
  )
}
