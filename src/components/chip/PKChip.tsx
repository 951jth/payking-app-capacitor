import type { CSSProperties, ReactNode } from 'react'
import { PKText } from '../typography/PKText'

type PKChipProps = {
  label?: ReactNode
  borderRadius?: number
  backgroundColor?: string
  height?: number
  paddingHorizontal?: number
  fontStyle?: CSSProperties
  wrapStyle?: CSSProperties
  wrapClassName?: string
  textClassName?: string
  useButton?: boolean
  onPress?: () => void
}

export function PKChip({
  label = '',
  borderRadius = 5,
  backgroundColor = '#DBE8FF',
  height = 20,
  paddingHorizontal = 8,
  fontStyle,
  wrapStyle,
  wrapClassName,
  textClassName,
  useButton = false,
  onPress,
}: PKChipProps) {
  const wrapperStyle: CSSProperties = {
    borderRadius,
    backgroundColor,
    height,
    paddingLeft: paddingHorizontal,
    paddingRight: paddingHorizontal,
    ...wrapStyle,
  }

  const labelNode = (
    <PKText
      as="span"
      className={[classes.label, textClassName].filter(Boolean).join(' ')}
      style={fontStyle}
      weight={600}
    >
      {label}
    </PKText>
  )

  if (useButton) {
    return (
      <button
        className={[classes.wrapper, wrapClassName].filter(Boolean).join(' ')}
        onClick={onPress}
        style={wrapperStyle}
        type="button"
      >
        {labelNode}
      </button>
    )
  }

  return (
    <span
      className={[classes.wrapper, wrapClassName].filter(Boolean).join(' ')}
      style={wrapperStyle}
    >
      {labelNode}
    </span>
  )
}

const classes = {
  wrapper: 'inline-flex shrink-0 items-center justify-center border-0 bg-transparent p-0',
  label: 'text-[10px] leading-none text-[#145ED9]',
}
