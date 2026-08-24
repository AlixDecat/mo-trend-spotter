import { useState } from 'react'
import type { Option } from '../types'

type ChipOption = Option & { hex?: string }

function Chip({
  option,
  selected,
  onClick,
}: {
  option: ChipOption
  selected: boolean
  onClick: () => void
}) {
  return (
    <button type="button" className={`chip ${selected ? 'chip-on' : ''}`} onClick={onClick}>
      {option.hex ? (
        <span
          className="inline-block h-3.5 w-3.5 shrink-0 rounded-full border border-black/15"
          style={{ background: option.hex }}
        />
      ) : null}
      {option.label}
    </button>
  )
}

// Les valeurs saisies librement (hors liste) restent visibles comme des puces.
function withExtras(options: ChipOption[], values: string[]): ChipOption[] {
  const known = new Set(options.map((o) => o.value))
  const extras = values.filter((v) => v && !known.has(v)).map((v) => ({ value: v, label: v }))
  return [...options, ...extras]
}

function CustomInput({ onAdd, placeholder }: { onAdd: (v: string) => void; placeholder?: string }) {
  const [text, setText] = useState('')
  function add() {
    const value = text.trim()
    if (!value) return
    setText('')
    onAdd(value)
  }
  return (
    <div className="mt-2 flex gap-2">
      <input
        className="input"
        value={text}
        placeholder={placeholder ?? 'Autre…'}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            add()
          }
        }}
      />
      <button type="button" className="btn shrink-0" onClick={add}>
        Ajouter
      </button>
    </div>
  )
}

export function ChipMulti({
  options,
  value,
  onChange,
  max,
  allowCustom,
}: {
  options: ChipOption[]
  value: string[]
  onChange: (v: string[]) => void
  max?: number
  allowCustom?: boolean
}) {
  function toggle(v: string) {
    if (value.includes(v)) {
      onChange(value.filter((x) => x !== v))
    } else {
      if (max !== undefined && value.length >= max) return
      onChange([...value, v])
    }
  }
  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        {withExtras(options, value).map((o) => (
          <Chip
            key={o.value}
            option={o}
            selected={value.includes(o.value)}
            onClick={() => toggle(o.value)}
          />
        ))}
      </div>
      {allowCustom ? (
        <CustomInput
          onAdd={(v) => {
            if (!value.includes(v)) toggle(v)
          }}
        />
      ) : null}
    </div>
  )
}

export function ChipSingle({
  options,
  value,
  onChange,
  allowCustom,
}: {
  options: ChipOption[]
  value: string
  onChange: (v: string) => void
  allowCustom?: boolean
}) {
  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        {withExtras(options, value ? [value] : []).map((o) => (
          <Chip
            key={o.value}
            option={o}
            selected={value === o.value}
            onClick={() => onChange(value === o.value ? '' : o.value)}
          />
        ))}
      </div>
      {allowCustom ? <CustomInput onAdd={(v) => onChange(v)} /> : null}
    </div>
  )
}
