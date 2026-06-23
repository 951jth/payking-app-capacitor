import type { CSSProperties } from 'react'
import { useEffect, useRef, useState } from 'react'
import { PKText } from '../typography/PKText'

export type PKWheelPickerOption<Value extends string | number = string | number> = {
  label: string
  value: Value
}

type PKWheelPickerProps<Value extends string | number = string | number> = {
  options: PKWheelPickerOption<Value>[]
  value?: Value
  onChange?: (value: Value) => void
  selectedOverlayStyle?: CSSProperties
}

const WHEEL_HEIGHT = 50
const VISIBLE_ITEMS = 5
const SETTLE_MS = 100

export function PKWheelPicker<Value extends string | number = string | number>({
  options,
  value,
  onChange,
  selectedOverlayStyle,
}: PKWheelPickerProps<Value>) {
  const listRef = useRef<HTMLDivElement | null>(null)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const lastYRef = useRef(0)
  const settleTimerRef = useRef<number | null>(null)
  const lastCommittedIndexRef = useRef<number | null>(null)

  useEffect(() => {
    if (!options.length) return

    const index = options.findIndex((option) => option.value === value)
    if (index < 0) return

    setSelectedIndex(index)
    lastCommittedIndexRef.current = index
    requestAnimationFrame(() => {
      listRef.current?.scrollTo({
        top: index * WHEEL_HEIGHT,
        behavior: 'auto',
      })
    })
  }, [options, value])

  useEffect(() => {
    return () => {
      if (settleTimerRef.current != null) {
        window.clearTimeout(settleTimerRef.current)
      }
    }
  }, [])

  const commitFromOffset = (offsetY: number) => {
    if (!options.length) return

    const index = Math.round(offsetY / WHEEL_HEIGHT)
    const clamped = Math.max(0, Math.min(index, options.length - 1))

    listRef.current?.scrollTo({
      top: clamped * WHEEL_HEIGHT,
      behavior: 'auto',
    })

    setSelectedIndex(clamped)

    if (lastCommittedIndexRef.current !== clamped) {
      lastCommittedIndexRef.current = clamped
      onChange?.(options[clamped].value)
    }
  }

  const handleScroll = () => {
    if (!listRef.current) return

    const offsetY = listRef.current.scrollTop
    lastYRef.current = offsetY

    if (settleTimerRef.current != null) {
      window.clearTimeout(settleTimerRef.current)
    }

    settleTimerRef.current = window.setTimeout(() => {
      commitFromOffset(lastYRef.current)
      settleTimerRef.current = null
    }, SETTLE_MS)
  }

  const handleItemPress = (index: number) => {
    setSelectedIndex(index)
    listRef.current?.scrollTo({
      top: index * WHEEL_HEIGHT,
      behavior: 'smooth',
    })

    if (lastCommittedIndexRef.current !== index) {
      lastCommittedIndexRef.current = index
      onChange?.(options[index].value)
    }
  }

  return (
    <div className={classes.container}>
      <div className={classes.wheelContainer}>
        <div
          className={classes.selectedOverlay}
          style={selectedOverlayStyle}
        />
        <div
          className={classes.list}
          onScroll={handleScroll}
          ref={listRef}
          style={{
            height: WHEEL_HEIGHT * VISIBLE_ITEMS,
            paddingBlock: (WHEEL_HEIGHT * (VISIBLE_ITEMS - 1)) / 2,
          }}
        >
          {options.map((option, index) => {
            const isSelected = index === selectedIndex

            return (
              <button
                className={classes.itemButton}
                key={`${option.value}-${index}`}
                onClick={() => handleItemPress(index)}
                style={{ height: WHEEL_HEIGHT }}
                type="button"
              >
                <PKText
                  as="span"
                  className={isSelected ? classes.selectedItemText : classes.itemText}
                  weight={500}
                >
                  {option.label}
                </PKText>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

const classes = {
  container: 'flex flex-1 items-center justify-center',
  wheelContainer: 'relative w-full',
  selectedOverlay:
    'pointer-events-none absolute left-0 right-0 top-1/2 z-[1] h-[50px] -translate-y-1/2 rounded-[20px] bg-[#e7e9ee]',
  list: 'relative z-[2] overflow-y-auto [-webkit-overflow-scrolling:touch] [scroll-snap-type:y_mandatory]',
  itemButton:
    'flex w-full shrink-0 snap-start items-center justify-center border-0 bg-transparent p-0',
  itemText: 'text-[16px] text-[#c7ced9]',
  selectedItemText: 'text-[16px] text-[#191919]',
}
