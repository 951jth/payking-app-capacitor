import type { CSSProperties, ElementType, HTMLAttributes, ReactNode } from 'react'

type PKTextProps = HTMLAttributes<HTMLElement> & {
  as?: ElementType
  children?: ReactNode
  weight?: CSSProperties['fontWeight']
}

export function PKText({
  as: Component = 'span',
  className,
  children,
  weight,
  style,
  ...props
}: PKTextProps) {
  return (
    <Component
      className={[classes.base, className].filter(Boolean).join(' ')}
      style={{ fontWeight: weight, ...style }}
      {...props}
    >
      {children}
    </Component>
  )
}

const classes = {
  base: 'pk-text text-sm tracking-normal text-[var(--pk-text)] font-[var(--pk-font-scd)]',
}
