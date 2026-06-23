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

type ResolvedColorType = Exclude<ColorType, 'standard'>

function resolveColorType(colorType: ColorType): ResolvedColorType {
  return colorType === 'standard' ? 'primary' : colorType
}

function isSolidColorType(colorType: ResolvedColorType) {
  return colorType === 'solid-primary' || colorType === 'solid-red'
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
  const isDisabled = Boolean(disabled || loading)
  const resolvedColorType = resolveColorType(colorType)
  const usesFillColor = buttonType === 'standard' || buttonType === 'rounded'
  const labelClassName =
    buttonType === 'text'
      ? [classes.textLabel, textClassName].filter(Boolean).join(' ')
      : [classes.label, textClassName].filter(Boolean).join(' ')

  return (
    <button
      className={[
        classes.base,
        classes.type[buttonType],
        usesFillColor && classes.fillColor[resolvedColorType],
        usesFillColor && classes.disabledFill,
        buttonType === 'outline' && classes.outlineColors,
        buttonType === 'outline' && isDisabled && classes.outlineDisabled,
        buttonType === 'text' && classes.textColors,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      disabled={isDisabled}
      type={type}
      {...props}
    >
      {loading ? (
        <LoaderCircle
          className={[
            classes.loader,
            usesFillColor && isSolidColorType(resolvedColorType)
              ? classes.loaderOnSolid
              : classes.loaderDefault,
          ]
            .filter(Boolean)
            .join(' ')}
          size={18}
        />
      ) : (
        <>
          <span className={labelClassName}>{title ?? children}</span>
          {icon ? <span>{icon}</span> : null}
        </>
      )}
    </button>
  )
}

const classes = {
  base:
    'inline-flex cursor-pointer items-center justify-center gap-2 border-0 p-0 font-[var(--pk-font-scd)] touch-manipulation select-none disabled:cursor-default',
  type: {
    text: 'h-6 min-h-6 rounded-xl bg-transparent px-0',
    standard: 'h-[50px] w-full min-w-0 rounded-2xl px-4',
    rounded: 'h-14 w-full min-w-0 rounded-[28px] px-4',
    outline:
      'h-14 w-full min-w-0 rounded-[28px] border bg-white px-4 disabled:bg-white',
  },
  fillColor: {
    primary: 'bg-[#dbe8ff] text-[#145ed9]',
    warning: 'bg-[#fedbdb] text-[#e22c17]',
    'solid-primary': 'bg-[#145ed9] text-white',
    'solid-red': 'bg-[#e22c17] text-white',
    disable: 'bg-[#e7e9ee] text-[#8b9099]',
  },
  disabledFill: 'disabled:!bg-[#e7e9ee] disabled:!text-[#8b9099]',
  outlineColors: 'border-[#145ed9] text-[#145ed9]',
  outlineDisabled: 'disabled:border-[#e7e9ee] disabled:text-[#8b9099]',
  textColors: 'text-[#8b9099]',
  label: 'overflow-hidden text-ellipsis whitespace-nowrap text-base font-semibold leading-none text-inherit',
  textLabel:
    'overflow-hidden text-ellipsis whitespace-nowrap text-xs font-normal leading-3 text-inherit',
  loader: 'animate-spin',
  loaderOnSolid: 'text-white',
  loaderDefault: 'text-[#145ed9]',
}
