import type { ButtonHTMLAttributes } from 'react'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import iconDown from '../../assets/icons/Icon_down.svg'
import { PKText } from '../typography/PKText'

export type PKSelectOption<Value extends string = string> = {
  label: string
  value: Value
}

type DropdownPlacement = 'bottom' | 'top'

type PKSelectProps<Value extends string = string> = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'onChange' | 'value'
> & {
  value: Value
  options: PKSelectOption<Value>[]
  onChange?: (value: Value) => void
  placeholder?: string
  maxHeight?: number
  wrapperClassName?: string
}

const OPTION_HEIGHT = 50

export function PKSelect<Value extends string = string>({
  value,
  options,
  onChange,
  placeholder = '선택하세요',
  maxHeight = 300,
  className,
  wrapperClassName,
  ...props
}: PKSelectProps<Value>) {
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const dropdownRef = useRef<HTMLDivElement | null>(null)
  const [open, setOpen] = useState(false)
  const [placement, setPlacement] = useState<DropdownPlacement>('bottom')
  const selectedOption = options.find((option) => option.value === value)

  const updatePlacement = useCallback(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return

    const rect = wrapper.getBoundingClientRect()
    const dropdownHeight = Math.min(
      dropdownRef.current?.scrollHeight ?? options.length * OPTION_HEIGHT,
      maxHeight,
    )
    const spaceBelow = window.innerHeight - rect.bottom
    const spaceAbove = rect.top

    setPlacement(
      spaceBelow < dropdownHeight + 8 && spaceAbove > spaceBelow ? 'top' : 'bottom',
    )
  }, [maxHeight, options.length])

  useLayoutEffect(() => {
    if (!open) return
    updatePlacement()
  }, [open, updatePlacement])

  useEffect(() => {
    if (!open) return

    const handleReposition = () => updatePlacement()

    window.addEventListener('resize', handleReposition)
    window.addEventListener('scroll', handleReposition, true)

    return () => {
      window.removeEventListener('resize', handleReposition)
      window.removeEventListener('scroll', handleReposition, true)
    }
  }, [open, updatePlacement])

  useEffect(() => {
    if (!open) return

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    window.addEventListener('mousedown', handlePointerDown)
    window.addEventListener('touchstart', handlePointerDown)

    return () => {
      window.removeEventListener('mousedown', handlePointerDown)
      window.removeEventListener('touchstart', handlePointerDown)
    }
  }, [open])

  const handleSelect = (nextValue: Value) => {
    onChange?.(nextValue)
    setOpen(false)
  }

  const handleToggle = () => {
    setOpen((current) => {
      const nextOpen = !current
      if (nextOpen) {
        requestAnimationFrame(updatePlacement)
      }
      return nextOpen
    })
  }

  return (
    <div
      className={[classes.root, wrapperClassName].filter(Boolean).join(' ')}
      ref={wrapperRef}
    >
      <button
        aria-expanded={open}
        className={[classes.trigger, className].filter(Boolean).join(' ')}
        onClick={handleToggle}
        type="button"
        {...props}
      >
        <PKText as="span" className={classes.label} weight={400}>
          {selectedOption?.label ?? placeholder}
        </PKText>
        <img alt="" className={classes.icon} src={iconDown} />
      </button>

      {open && (
        <div
          className={[
            classes.dropdown,
            placement === 'top' ? classes.dropdownTop : classes.dropdownBottom,
          ].join(' ')}
          ref={dropdownRef}
          style={{ maxHeight }}
        >
          {options.map((option) => (
            <button
              className={classes.option}
              key={option.value}
              onClick={() => handleSelect(option.value)}
              type="button"
            >
              <PKText as="span" className={classes.optionText} weight={400}>
                {option.label}
              </PKText>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

const classes = {
  root: 'relative inline-flex min-w-0',
  trigger:
    'relative m-0 inline-flex min-w-0 items-center justify-center gap-[5px] border-0 bg-transparent px-2 py-0',
  label:
    'pointer-events-none min-w-0 truncate text-[12px] leading-[1.2] text-[#8EA0BB]',
  icon: 'pointer-events-none h-[7px] w-[10px] shrink-0',
  dropdown:
    'absolute left-0 z-[80] min-w-full overflow-y-auto rounded-[20px] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.15)]',
  dropdownBottom: 'top-[calc(100%+1px)]',
  dropdownTop: 'bottom-[calc(100%+1px)]',
  option:
    'flex h-[50px] w-full items-center justify-center border-0 border-b border-solid border-b-[#D6DEEB] bg-white px-4 py-0 last:border-b-0',
  optionText:
    'whitespace-nowrap text-center text-[14px] leading-[1.2] text-[#191919]',
}
