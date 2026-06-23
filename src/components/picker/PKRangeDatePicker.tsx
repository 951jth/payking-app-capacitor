import dayjs from 'dayjs'
import { PKText } from '../typography/PKText'
import { PKBottomDatePicker } from './PKBottomDatePicker'

type PKRangeDatePickerProps = {
  value?: string[]
  onChange?: (value: string[]) => void
  useBoxIcon?: boolean
  className?: string
  format?: string
  placeholder?: string
  disabled?: boolean
}

function isDayDiff(fromDate?: string, toDate?: string) {
  if (!fromDate || !toDate) return false
  return dayjs(fromDate).isAfter(dayjs(toDate))
}

export function PKRangeDatePicker({
  value = [],
  onChange,
  useBoxIcon = false,
  className,
  format = 'YY/M/D',
  placeholder = '연도/월/일',
  disabled = false,
}: PKRangeDatePickerProps) {
  const [startDate, endDate] = value

  return (
    <div className={[classes.root, className].filter(Boolean).join(' ')}>
      <PKBottomDatePicker
        disabled={disabled}
        format={format}
        onChange={(selected) => {
          if (isDayDiff(selected, endDate)) return
          onChange?.([selected, endDate ?? ''])
        }}
        placeholder={placeholder}
        textClassName={classes.centerText}
        useBoxIcon={useBoxIcon}
        value={startDate}
      />
      <PKText as="span" className={classes.divider} weight={400}>
        ~
      </PKText>
      <PKBottomDatePicker
        disabled={disabled}
        format={format}
        onChange={(selected) => {
          if (isDayDiff(startDate, selected)) return
          onChange?.([startDate ?? '', selected])
        }}
        placeholder={placeholder}
        textClassName={classes.centerText}
        useBoxIcon={useBoxIcon}
        value={endDate}
      />
    </div>
  )
}

const classes = {
  root: 'flex items-center gap-2',
  divider: 'shrink-0 text-[#191919]',
  centerText: 'text-center',
}
