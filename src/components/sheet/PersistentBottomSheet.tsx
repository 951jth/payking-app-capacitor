import type { CSSProperties, PointerEvent, ReactNode } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { PKText } from '../typography/PKText'

export type PersistentBottomSheetState = 'collapsed' | 'open' | 'hidden'

type PersistentBottomSheetProps = {
  title: ReactNode
  children?: ReactNode
  state: PersistentBottomSheetState
  onStateChange?: (state: PersistentBottomSheetState) => void
  collapsedHeight?: number
  maxHeight?: CSSProperties['height']
  className?: string
  bodyClassName?: string
}

const DRAG_THRESHOLD = 48
const DEFAULT_COLLAPSED_HEIGHT = 72

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

export function PersistentBottomSheet({
  title,
  children,
  state,
  onStateChange,
  collapsedHeight = DEFAULT_COLLAPSED_HEIGHT,
  maxHeight = '80%',
  className,
  bodyClassName,
}: PersistentBottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement | null>(null)
  const dragStartRef = useRef<{
    pointerId: number
    y: number
    translateY: number
  } | null>(null)
  const [sheetHeight, setSheetHeight] = useState(0)
  const [dragTranslateY, setDragTranslateY] = useState<number | null>(null)
  const [canAnimateTransform, setCanAnimateTransform] = useState(false)
  const [hasEntered, setHasEntered] = useState(false)

  useEffect(() => {
    const element = sheetRef.current
    if (!element) return

    const observer = new ResizeObserver(([entry]) => {
      setSheetHeight(entry.contentRect.height)
    })

    observer.observe(element)

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (sheetHeight <= collapsedHeight || hasEntered) return

    let enterFrameId = 0
    const enableTransitionFrameId = requestAnimationFrame(() => {
      setCanAnimateTransform(true)
      enterFrameId = requestAnimationFrame(() => {
        setHasEntered(true)
      })
    })

    return () => {
      cancelAnimationFrame(enableTransitionFrameId)
      if (enterFrameId) cancelAnimationFrame(enterFrameId)
    }
  }, [collapsedHeight, hasEntered, sheetHeight])

  const positions = useMemo(() => {
    const height = sheetHeight || collapsedHeight
    const collapsed = Math.max(height - collapsedHeight, 0)

    return {
      open: 0,
      collapsed,
      hidden: height + 16,
    }
  }, [collapsedHeight, sheetHeight])

  const translateY = dragTranslateY ?? positions[state]
  const isMeasured = sheetHeight > collapsedHeight
  const transformTranslateY =
    dragTranslateY != null
      ? `${translateY}px`
      : !isMeasured
        ? '100%'
        : !hasEntered
          ? `${positions.hidden}px`
          : `${translateY}px`

  const getNearestState = (value: number, velocityDirection: 'up' | 'down' | 'none') => {
    if (velocityDirection === 'up' && value < positions.collapsed - DRAG_THRESHOLD) {
      return 'open'
    }

    if (velocityDirection === 'down' && value > positions.open + DRAG_THRESHOLD) {
      return 'collapsed'
    }

    const distances = {
      open: Math.abs(value - positions.open),
      collapsed: Math.abs(value - positions.collapsed),
    }

    return distances.open < distances.collapsed ? 'open' : 'collapsed'
  }

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    const height = sheetRef.current?.getBoundingClientRect().height ?? sheetHeight
    if (height && height !== sheetHeight) {
      setSheetHeight(height)
    }

    dragStartRef.current = {
      pointerId: event.pointerId,
      y: event.clientY,
      translateY,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const start = dragStartRef.current
    if (!start || start.pointerId !== event.pointerId) return

    const nextTranslateY = clamp(
      start.translateY + event.clientY - start.y,
      positions.open,
      positions.hidden,
    )

    setDragTranslateY(nextTranslateY)
  }

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const start = dragStartRef.current
    if (!start || start.pointerId !== event.pointerId) return

    const nextTranslateY = dragTranslateY ?? translateY
    const deltaY = event.clientY - start.y
    const direction = deltaY < 0 ? 'up' : deltaY > 0 ? 'down' : 'none'
    const nextState = getNearestState(nextTranslateY, direction)

    dragStartRef.current = null
    setDragTranslateY(null)
    onStateChange?.(nextState)
  }

  const handlePointerCancel = () => {
    dragStartRef.current = null
    setDragTranslateY(null)
  }

  return (
    <div
      className={[classes.sheet, className].filter(Boolean).join(' ')}
      ref={sheetRef}
      style={{
        height: maxHeight,
        transform: `translate3d(0, ${transformTranslateY}, 0)`,
        transition:
          dragTranslateY == null && canAnimateTransform
            ? 'transform 260ms ease'
            : 'none',
      }}
    >
      <div
        className={classes.dragArea}
        onPointerCancel={handlePointerCancel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <div className={classes.handleWrap}>
          <div className={classes.handle} />
        </div>
        <PKText as="div" className={classes.title} weight={200}>
          {title}
        </PKText>
      </div>
      <div className={[classes.body, bodyClassName].filter(Boolean).join(' ')}>
        {children}
      </div>
    </div>
  )
}

const classes = {
  sheet:
    'absolute bottom-0 left-0 right-0 z-20 overflow-hidden rounded-t-[32px] bg-white shadow-[0_-4px_16px_rgba(29,31,72,0.12)] will-change-transform',
  dragArea:
    'flex touch-none select-none flex-col items-center justify-center bg-white',
  handleWrap:
    'flex h-6 items-center justify-center',
  handle:
    'h-1 w-[60px] rounded-sm bg-[var(--pk-border)]',
  title:
    'box-border w-full pb-5 pt-2 text-center text-[16px] leading-[1.2] text-[var(--pk-text)]',
  body:
    'min-h-0 overflow-y-auto bg-white [-webkit-overflow-scrolling:touch]',
}
