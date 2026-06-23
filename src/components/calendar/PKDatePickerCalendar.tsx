import dayjs, { type Dayjs } from 'dayjs'
import { useMemo, useState } from 'react'
import iconArrowLeft from '../../assets/icons/Icon_arrow_left_20.svg'
import iconArrowRight from '../../assets/icons/Icon_arrow_right_20.svg'
import { PKText } from '../typography/PKText'

const DAYS = ['일', '월', '화', '수', '목', '금', '토']

type CalendarCell = {
  date: Dayjs
  type: 'prev' | 'current' | 'next'
}

type PKDatePickerCalendarProps = {
  selectedDate?: Dayjs | null
  onSelectedDateChange?: (date: Dayjs) => void
  disabledDate?: (date: Dayjs) => boolean
}

export function PKDatePickerCalendar({
  selectedDate = dayjs(),
  onSelectedDateChange,
  disabledDate,
}: PKDatePickerCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(() => dayjs(selectedDate ?? undefined))

  const calendarDates = useMemo(() => {
    const startOfMonth = currentMonth.startOf('month')
    const endOfMonth = currentMonth.endOf('month')
    const daysInMonth = endOfMonth.date()
    const startDay = startOfMonth.day()
    const prevMonth = currentMonth.subtract(1, 'month')
    const daysInPrevMonth = prevMonth.daysInMonth()
    const rowCount = Math.ceil((startDay + daysInMonth) / 7)
    const totalCells = rowCount * 7
    const dates: CalendarCell[] = []

    for (let index = 0; index < totalCells; index += 1) {
      const dayOffset = index - startDay

      if (index < startDay) {
        dates.push({
          date: prevMonth.date(daysInPrevMonth - startDay + index + 1),
          type: 'prev',
        })
      } else if (dayOffset >= 0 && dayOffset < daysInMonth) {
        dates.push({
          date: currentMonth.date(dayOffset + 1),
          type: 'current',
        })
      } else {
        dates.push({
          date: currentMonth.add(1, 'month').date(dayOffset - daysInMonth + 1),
          type: 'next',
        })
      }
    }

    return dates
  }, [currentMonth])

  const isToday = (date: Dayjs) => dayjs().isSame(date, 'day')
  const isSelected = (date: Dayjs) => Boolean(selectedDate?.isSame(date, 'day'))

  return (
    <div className={classes.container}>
      <div className={classes.header}>
        <button
          aria-label="이전 달"
          className={classes.headerButton}
          onClick={() => setCurrentMonth((prev) => prev.subtract(1, 'month'))}
          type="button"
        >
          <img alt="" aria-hidden className={classes.headerIcon} src={iconArrowLeft} />
        </button>
        <PKText as="p" className={classes.monthLabel} weight={200}>
          {currentMonth.format('YYYY년 M월')}
        </PKText>
        <button
          aria-label="다음 달"
          className={classes.headerButton}
          onClick={() => setCurrentMonth((prev) => prev.add(1, 'month'))}
          type="button"
        >
          <img alt="" aria-hidden className={classes.headerIcon} src={iconArrowRight} />
        </button>
      </div>

      <div className={classes.weekRow}>
        {DAYS.map((day) => (
          <PKText as="span" className={classes.weekDay} key={day} weight={200}>
            {day}
          </PKText>
        ))}
      </div>

      <div className={classes.grid}>
        {calendarDates.map((item, index) => {
          const disabled = disabledDate?.(item.date) ?? false
          const isCurrentMonth = item.type === 'current'
          const selected = isSelected(item.date)
          const dayTextColor = selected
            ? '#ffffff'
            : isCurrentMonth
              ? '#191919'
              : '#c7ced9'

          return (
            <button
              className={classes.dayButton}
              disabled={disabled || !isCurrentMonth}
              key={`${item.date.format('YYYY-MM-DD')}-${index}`}
              onClick={() => onSelectedDateChange?.(item.date)}
              type="button"
            >
              <span
                className={[
                  classes.dayInner,
                  selected && classes.selectedDayBg,
                  disabled && classes.disabledDay,
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <PKText as="span" style={{ color: dayTextColor }} weight={600}>
                  {item.date.date()}
                </PKText>
              </span>
              {isToday(item.date) && isCurrentMonth ? (
                <PKText as="span" className={classes.todayLabel} weight={500}>
                  오늘
                </PKText>
              ) : null}
            </button>
          )
        })}
      </div>
    </div>
  )
}

const classes = {
  container: 'w-full',
  header: 'flex items-center justify-center gap-2',
  headerButton:
    'inline-flex border-0 bg-transparent px-0 py-2.5 pb-0.5 touch-manipulation',
  headerIcon: 'h-5 w-5',
  monthLabel: 'm-0 px-0 py-2.5 pb-0.5 text-[16px] text-[#191919]',
  weekRow: 'flex justify-between border-b border-[#e7e9ee] py-2',
  weekDay: 'w-[14.285%] text-center text-[12px] text-[#191919]',
  grid: 'grid grid-cols-7',
  dayButton:
    'relative flex h-12 items-center justify-center border-0 bg-transparent p-0 touch-manipulation disabled:cursor-default',
  dayInner: 'flex h-[30px] w-[30px] items-center justify-center text-[12px]',
  selectedDayBg: 'rounded-full bg-[var(--pk-primary)]',
  disabledDay: 'opacity-30',
  todayLabel: 'absolute bottom-[-1px] text-[8px] text-[var(--pk-primary)]',
}
