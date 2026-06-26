import dayjs, { type Dayjs } from 'dayjs'
import { useState } from 'react'
import iconCalendarGray from '../../assets/icons/Icon_calendar_gray.svg'
import { BottomModal } from '../modal/BottomModal'
import { PKButton } from '../button/PKButton'
import { PKDatePickerCalendar } from '../calendar/PKDatePickerCalendar'
import { PKText } from '../typography/PKText'

type PKBottomDatePickerProps = {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  format?: string
  useBoxIcon?: boolean
  className?: string
  textClassName?: string
  disabledDate?: (date: Dayjs) => boolean
  disabled?: boolean
}

export function PKBottomDatePicker({
  value,
  onChange,
  placeholder = '연도.월.일',
  format = 'YYYY.MM.DD',
  useBoxIcon = true,
  className,
  textClassName,
  disabledDate,
  disabled = false,
}: PKBottomDatePickerProps) {
  const [open, setOpen] = useState(false)
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Dayjs>(dayjs())

  const openPicker = () => {
    if (disabled) return
    setSelectedCalendarDate(value ? dayjs(value) : dayjs())
    setOpen(true)
  }

  const handleApply = () => {
    onChange?.(selectedCalendarDate.format('YYYY-MM-DD'))
    setOpen(false)
  }

  return (
    <>
      <button
        className={[classes.valueWrap, className].filter(Boolean).join(' ')}
        disabled={disabled}
        onClick={openPicker}
        type="button"
      >
        <PKText
          as="span"
          className={[
            classes.value,
            disabled ? classes.disabledValue : value ? classes.activeValue : classes.placeholder,
            textClassName,
          ]
            .filter(Boolean)
            .join(' ')}
          weight={500}
        >
          {value ? dayjs(value).format(format) : placeholder}
        </PKText>
        {useBoxIcon ? (
          <img alt="" aria-hidden className={classes.calendarIcon} src={iconCalendarGray} />
        ) : null}
      </button>

      <BottomModal onClose={() => setOpen(false)} visible={open}>
        <div className={classes.sheet}>
          <div className={classes.calendarWrap}>
            <PKDatePickerCalendar
              key={selectedCalendarDate.format('YYYY-MM-DD')}
              disabledDate={disabledDate}
              onSelectedDateChange={setSelectedCalendarDate}
              selectedDate={selectedCalendarDate}
            />
          </div>
          <div className={classes.actions}>
            <PKButton
              type="standard"
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
  valueWrap:
    'flex h-12 min-w-0 flex-1 items-center justify-between border-0 border-b border-[#e7e9ee] bg-transparent px-1 disabled:cursor-default',
  value: 'min-w-0 flex-1 text-[16px]',
  activeValue: 'text-[#191919]',
  placeholder: 'text-[#c7ced9]',
  disabledValue: 'text-[#8b9099]',
  calendarIcon: 'h-6 w-6 shrink-0',
  sheet: 'px-5 pb-5 pt-2',
  calendarWrap: 'min-h-[355px]',
  actions: 'pt-2.5',
}
