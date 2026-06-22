import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { LoaderCircle } from 'lucide-react'

type ButtonType = 'text' | 'standard' | 'rounded' | 'outline'
type ColorType =
  | 'primary'
  | 'warning'
  | 'solid-primary'
  | 'solid-red'
  | 'disable'
  | 'standard'

type PKButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  title?: ReactNode
  buttonType?: ButtonType
  colorType?: ColorType
  loading?: boolean
  icon?: ReactNode
  textClassName?: string
}

export function PKButton({
  title,
  children,
  buttonType = 'text',
  colorType = 'primary',
  loading = false,
  icon,
  className,
  textClassName,
  disabled,
  type = 'button',
  ...props
}: PKButtonProps) {
  const labelClassName =
    buttonType === 'text'
      ? [classes.textLabel, textClassName].filter(Boolean).join(' ')
      : [classes.label, textClassName].filter(Boolean).join(' ')

  return (
    <button
      className={[
        classes.base,
        classes.type[buttonType],
        buttonType !== 'text' && buttonType !== 'outline' && classes.color[colorType],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      disabled={disabled || loading}
      type={type}
      {...props}
    >
      {loading ? (
        <LoaderCircle className={classes.loader} size={18} />
      ) : (
        <>
          {icon && <span>{icon}</span>}
          <span className={labelClassName}>{title ?? children}</span>
        </>
      )}
    </button>
  )
}

const classes = {
  base:
    'inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border-0 p-0 font-[var(--pk-font-scd)] text-[var(--pk-muted)] touch-manipulation select-none disabled:cursor-default',
  type: {
    text: 'h-6 min-h-6 bg-transparent text-xs leading-none text-[var(--pk-muted)] disabled:bg-transparent disabled:text-[var(--pk-muted)]',
    standard:
      'h-[50px] w-full min-w-0 rounded-2xl px-4 disabled:bg-[var(--pk-border)] disabled:text-[var(--pk-muted)]',
    rounded:
      'h-14 w-full min-w-0 rounded-[28px] px-4 disabled:bg-[var(--pk-border)] disabled:text-[var(--pk-muted)]',
    outline:
      'h-14 w-full min-w-0 rounded-[28px] border border-[var(--pk-primary)] bg-white px-4 disabled:border-[var(--pk-border)] disabled:bg-white disabled:text-[var(--pk-muted)]',
  },
  color: {
    primary: 'bg-[#dbe8ff] text-[var(--pk-primary)]',
    warning: 'bg-[#fedbdb] text-[var(--pk-danger)]',
    'solid-primary': 'bg-[var(--pk-primary)] text-white',
    'solid-red': 'bg-[var(--pk-danger)] text-white',
    disable: 'bg-[var(--pk-border)] text-[var(--pk-muted)]',
    standard: '',
  },
  label: 'overflow-hidden text-ellipsis whitespace-nowrap text-base font-semibold text-inherit',
  textLabel:
    'overflow-hidden text-ellipsis whitespace-nowrap text-xs font-extralight leading-3 text-inherit',
  loader: 'animate-spin',
}
