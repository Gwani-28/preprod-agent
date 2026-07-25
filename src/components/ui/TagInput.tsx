import { KeyboardEvent, useState } from 'react'

interface Props {
  value: string[]
  onChange: (next: string[]) => void
  placeholder?: string
}

export function TagInput({ value, onChange, placeholder }: Props) {
  const [text, setText] = useState('')

  const commit = () => {
    const t = text.trim()
    if (!t) return
    if (value.includes(t)) {
      setText('')
      return
    }
    onChange([...value, t])
    setText('')
  }

  const removeAt = (i: number) => onChange(value.filter((_, idx) => idx !== i))

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      commit()
    } else if (e.key === 'Backspace' && !text && value.length > 0) {
      removeAt(value.length - 1)
    }
  }

  return (
    <div className="flex min-h-11 flex-wrap items-center gap-1.5 rounded border border-ink-700 bg-ink-800 px-2 py-1.5 focus-within:border-ink-300 focus-within:ring-1 focus-within:ring-ink-300">
      {value.map((v, i) => (
        <span
          key={`${v}-${i}`}
          className="inline-flex min-h-8 items-center gap-1 rounded bg-ink-700 px-2 py-1 text-xs text-ink-100"
        >
          {v}
          <button
            type="button"
            onClick={() => removeAt(i)}
            className="text-ink-400 hover:text-red-300"
            aria-label={`${v} 제거`}
          >
            ✕
          </button>
        </span>
      ))}
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={onKey}
        onBlur={commit}
        placeholder={value.length === 0 ? placeholder : ''}
        className="min-h-8 min-w-[140px] flex-1 border-none bg-transparent px-1 py-1 text-base focus:outline-none focus:ring-0 sm:text-sm"
      />
    </div>
  )
}
