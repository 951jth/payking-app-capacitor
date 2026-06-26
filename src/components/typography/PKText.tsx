import type { CSSProperties, ElementType, HTMLAttributes, ReactNode } from 'react'

type PKTextProps = HTMLAttributes<HTMLElement> & {
  as?: ElementType
  children?: ReactNode
  numberOfLines?: number
  weight?: CSSProperties['fontWeight']
}

export function PKText({
  as: Component = 'span',
  className,
  children,
  numberOfLines = 0,
  weight,
  style,
  ...props
}: PKTextProps) {
  return (
    <Component
      className={[classes.base, className].filter(Boolean).join(' ')}
      style={{
        fontWeight: weight,
        ...getLineClampStyle(numberOfLines),
        ...style,
      }}
      {...props}
    >
      {children}
    </Component>
  )
}

function getLineClampStyle(numberOfLines: number): CSSProperties {
  if (numberOfLines <= 0) return {}

  if (numberOfLines === 1) {
    return {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    }
  }

  return {
    display: '-webkit-box',
    overflow: 'hidden',
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: numberOfLines,
  }
}

const classes = {
  base: 'pk-text text-sm tracking-normal text-[var(--pk-text)] font-[var(--pk-font-scd)]',
}
