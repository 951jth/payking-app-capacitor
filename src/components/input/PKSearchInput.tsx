import type { InputHTMLAttributes, ReactNode } from 'react'
import { useRef, useState } from 'react'
import iconClear from '../../assets/icons/Icon_clear.svg'
import iconSearch from '../../assets/icons/Icon_search.svg'
import { PKIconButton } from '../button/PKIconButton'

type PKSearchInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'value' | 'onChange'
> & {
  value?: string
  onChangeText?: (value: string) => void
  postButton?: ReactNode
  className?: string
}

export function PKSearchInput({
  value = '',
  onChangeText,
  postButton,
  className,
  placeholder,
  disabled,
  ...props
}: PKSearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [focused, setFocused] = useState(false)
  const showPlaceholder = Boolean(placeholder) && value.length === 0 && !focused

  return (
    <div
      className={[classes.wrapper, className].filter(Boolean).join(' ')}
      onClick={() => inputRef.current?.focus()}
      role="presentation"
    >
      <img alt="" aria-hidden className={classes.searchIcon} src={iconSearch} />

      <div className={classes.field}>
        {showPlaceholder ? (
          <span className={classes.placeholder} style={{ fontWeight: 200 }}>
            {placeholder}
          </span>
        ) : null}
        <input
          ref={inputRef}
          className={classes.input}
          disabled={disabled}
          onBlur={() => setFocused(false)}
          onChange={(event) => onChangeText?.(event.target.value)}
          onFocus={() => setFocused(true)}
          style={{ fontWeight: 200 }}
          type="text"
          value={value}
          {...props}
        />
      </div>

      {value.length > 0 ? (
        <PKIconButton
          aria-label="입력 내용 지우기"
          className={classes.clearButton}
          icon={<img alt="" aria-hidden className={classes.clearIcon} src={iconClear} />}
          onClick={(event) => {
            event.stopPropagation()
            onChangeText?.('')
            inputRef.current?.focus()
          }}
        />
      ) : null}

      {postButton}
    </div>
  )
}

const classes = {
  wrapper:
    'flex h-10 w-full cursor-text items-center gap-2 rounded-[20px] bg-[#e7e9ee] px-3',
  searchIcon: 'h-5 w-5 shrink-0',
  field: 'relative flex h-full min-w-0 flex-1 items-center',
  placeholder:
    'pointer-events-none absolute left-0 z-[2] truncate text-[14px] font-[var(--pk-font-scd)] text-[#8b9099]',
  input:
    'relative z-[1] h-full min-w-0 flex-1 border-0 bg-transparent p-0 font-[var(--pk-font-scd)] text-[14px] text-[#191919] outline-none',
  clearButton: 'h-8 w-8 shrink-0',
  clearIcon: 'h-4 w-4',
}
