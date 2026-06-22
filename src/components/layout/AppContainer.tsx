import type { CSSProperties, PropsWithChildren, ReactNode } from 'react'

type AppContainerProps = PropsWithChildren<{
  topChildren?: ReactNode
  bottomChildren?: ReactNode
  className?: string
  bottomClassName?: string
  bottomPadding?: boolean
  contentClassName?: string
  contentStyle?: CSSProperties
  useScrollView?: boolean
}>

export function AppContainer({
  topChildren,
  bottomChildren,
  children,
  className,
  bottomClassName,
  bottomPadding = true,
  contentClassName,
  contentStyle,
  useScrollView = true,
}: AppContainerProps) {
  const content = (
    <div
      className={[
        useScrollView ? classes.contentScrollable : classes.contentFlex,
        contentClassName,
      ]
        .filter(Boolean)
        .join(' ')}
      style={contentStyle}
    >
      {children}
    </div>
  )

  return (
    <main className={[classes.root, className].filter(Boolean).join(' ')}>
      {topChildren && <div className={classes.top}>{topChildren}</div>}
      {useScrollView ? <div className={classes.scroll}>{content}</div> : content}
      {bottomChildren && (
        <div
          className={[
            bottomPadding ? classes.bottomPadded : classes.bottomBare,
            bottomClassName,
          ]
            .filter(Boolean)
            .join(' ')}
          data-container-bottom=""
        >
          {bottomChildren}
        </div>
      )}
    </main>
  )
}

const classes = {
  root: 'flex h-full min-h-0 w-full flex-col bg-white',
  top: 'z-10 shrink-0 bg-white',
  scroll:
    'flex min-h-0 flex-1 flex-col overflow-y-auto [-webkit-overflow-scrolling:touch]',
  contentScrollable: 'box-border min-h-full w-full',
  contentFlex: 'box-border flex min-h-0 w-full flex-1 flex-col overflow-hidden',
  bottomBare: 'z-10 shrink-0 bg-white',
  bottomPadded:
    'z-10 shrink-0 bg-white px-5 pb-[calc(20px+env(safe-area-inset-bottom))] pt-4',
}
