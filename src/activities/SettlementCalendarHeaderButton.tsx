import iconCalendarGray from '../assets/icons/Icon_calendar_gray.svg'
import { PKIconButton } from '../components'
import { useAlertStore } from '../stores/alertStore'

export function SettlementCalendarHeaderButton() {
  const showAlert = useAlertStore((state) => state.showAlert)

  return (
    <PKIconButton
      aria-label="정산 캘린더"
      icon={<img alt="" className={classes.calendarIcon} src={iconCalendarGray} />}
      onClick={() =>
        showAlert({
          title: '준비 중',
          contents: '정산 캘린더 화면은 activity 연결 후 열립니다.',
        })
      }
    />
  )
}

const classes = {
  calendarIcon: 'h-5 w-5',
}
