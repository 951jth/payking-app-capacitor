import type { CSSProperties, ReactNode } from 'react'
import { useMemo, useState } from 'react'
import iconDown20 from '../../assets/icons/Icon_down_20.svg'
import { BottomModal } from '../modal/BottomModal'
import { PKButton } from '../button/PKButton'
import { PKText } from '../typography/PKText'
import { PKWheelPicker, type PKWheelPickerOption } from './PKWheelPicker'

type PKBottomWheelPickerProps<Value extends string | number = string | number> = {
  value?: Value[]
  options?: PKWheelPickerOption<Value>[][]
  onChange?: (value: Value[]) => void
  onDismiss?: () => void
  placeholder?: string
  pickerTitle?: string
  forceTitle?: string
  valueWrap?: ReactNode
  rightIcon?: ReactNode
  className?: string
}

export function PKBottomWheelPicker<Value extends string | number = string | number>({
  value = [],
  options = [],
  onChange,
  onDismiss,
  placeholder = '선택해주세요',
  pickerTitle,
  forceTitle,
  valueWrap,
  rightIcon,
  className,
}: PKBottomWheelPickerProps<Value>) {
  const [open, setOpen] = useState(false)
  const [selectedData, setSelectedData] = useState<Value[]>([])

  const openPicker = () => {
    const defaultValue = options.map((column) => column[0]?.value)
    setSelectedData(value.length > 0 ? [...value] : (defaultValue as Value[]))
    setOpen(true)
  }

  const valueLabel = useMemo(() => {
    if (value.length === 0) return ''

    return value
      .map((item, index) => {
        const matched = options[index]?.find((option) => option.value === item)
        return matched?.label
      })
      .filter(Boolean)
      .join(' ')
  }, [options, value])

  const handleApply = () => {
    onChange?.(selectedData)
    setOpen(false)
  }

  const handleClose = () => {
    setOpen(false)
    onDismiss?.()
  }

  return (
    <>
      {valueWrap ? (
        <button
          className={[classes.triggerReset, className].filter(Boolean).join(' ')}
          onClick={openPicker}
          type="button"
        >
          {valueWrap}
        </button>
      ) : (
        <button
          className={[classes.valueWrap, className].filter(Boolean).join(' ')}
          onClick={openPicker}
          type="button"
        >
          <PKText
            as="span"
            className={value.length > 0 ? classes.valueText : classes.placeholderText}
            weight={500}
          >
            {forceTitle ?? (value.length > 0 ? valueLabel : placeholder)}
          </PKText>
          {rightIcon ?? (
            <img alt="" aria-hidden className={classes.downIcon} src={iconDown20} />
          )}
        </button>
      )}

      <BottomModal onClose={handleClose} useScrollView={false} visible={open}>
        <div className={classes.sheet}>
          {pickerTitle ? (
            <PKText as="p" className={classes.pickerTitle} weight={200}>
              {pickerTitle}
            </PKText>
          ) : null}

          <div className={classes.optionsList}>
            {options.map((column, index) => {
              const overlayStyle: CSSProperties = {
                borderTopLeftRadius: index === 0 ? 20 : 0,
                borderBottomLeftRadius: index === 0 ? 20 : 0,
                borderTopRightRadius: index === options.length - 1 ? 20 : 0,
                borderBottomRightRadius: index === options.length - 1 ? 20 : 0,
              }

              return (
                <div className={classes.wheelColumn} key={`wheel-${index}`}>
                  <PKWheelPicker
                    onChange={(nextValue) => {
                      setSelectedData((prev) => {
                        const next = [...prev]
                        next[index] = nextValue
                        return next
                      })
                    }}
                    options={column}
                    selectedOverlayStyle={overlayStyle}
                    value={selectedData[index]}
                  />
                </div>
              )
            })}
          </div>

          <div className={classes.actions}>
            <PKButton
              buttonType="standard"
              colorType="primary"
              onClick={handleApply}
              title="적용"
            />
          </div>
        </div>
      </BottomModal>
    </>
  )
}

const classes = {
  triggerReset: 'border-0 bg-transparent p-0',
  valueWrap:
    'flex h-12 w-full items-center justify-between border-0 border-b border-[#e7e9ee] bg-transparent px-1',
  valueText: 'text-[14px] text-[#191919]',
  placeholderText: 'text-[14px] text-[#c7ced9]',
  downIcon: 'h-5 w-5 shrink-0',
  sheet: 'px-5 pb-5 pt-2',
  pickerTitle: 'm-0 py-2.5 text-center text-[16px] text-[#191919]',
  optionsList: 'flex items-center justify-center',
  wheelColumn: 'min-w-0 flex-1',
  actions: 'pt-5',
}
