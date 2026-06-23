import dayjs from 'dayjs'
import { PaymentItem, PKMoreButton, PKSelect, PKText, PersistentBottomSheet } from '../../components'
import type { PKSelectOption, PersistentBottomSheetState } from '../../components'
import { useAlertStore } from '../../stores/alertStore'
import { addCommasToNumber } from '../../utils/format'
import {
  type RecentPaymentSort,
  useRecentPaymentSheetData,
} from './useRecentPaymentSheetData'

const sortOptions = [
  { label: '최신순 (모든 결제건)', value: 'statusDate,DESC' },
  { label: '과거순 (모든 결제건)', value: 'statusDate,ASC' },
] satisfies PKSelectOption<RecentPaymentSort>[]

const weekDays = ['일', '월', '화', '수', '목', '금', '토']
const weekStart = dayjs().startOf('week')
const thisWeek = Array.from({ length: 7 }, (_, index) => weekStart.add(index, 'day'))

type HomeRecentPaymentSheetProps = {
  state: PersistentBottomSheetState
  onStateChange: (state: PersistentBottomSheetState) => void
}

export function HomeRecentPaymentSheet({
  state,
  onStateChange,
}: HomeRecentPaymentSheetProps) {
  const showAlert = useAlertStore((store) => store.showAlert)
  const { sort, setSort, payments, weeklySettlementAmounts } =
    useRecentPaymentSheetData()

  const openPlaceholder = (label: string) => {
    showAlert({
      title: '준비 중',
      contents: `${label} 화면은 activity 연결 후 열립니다.`,
    })
  }

  return (
    <PersistentBottomSheet
      bodyClassName={classes.sheetBody}
      className={classes.sheet}
      maxHeight="calc(100% - 64px)"
      onStateChange={onStateChange}
      state={state}
      title="최근 결제 내역"
    >
      <div className={classes.root}>
        <div className={classes.toolbar}>
          <PKSelect
            onChange={setSort}
            options={sortOptions}
            placeholder="정렬"
            value={sort}
          />
        </div>

        <div className={classes.list}>
          {payments.length > 0 ? (
            payments.map((item, index) => (
              <PaymentItem
                isGotoDetail={false}
                item={item}
                key={item.id ?? index}
              />
            ))
          ) : (
            <PKText as="p" className={classes.empty} weight={200}>
              결제 내역이 없습니다.
            </PKText>
          )}
        </div>

        <div className={classes.moreWrap}>
          <PKMoreButton
            className="h-auto min-h-0 p-0"
            onClick={() => openPlaceholder('결제 현황')}
            title="더 보기"
          />
        </div>

        <div className={classes.divider} />

        <div className={classes.calendarHeader}>
          <PKMoreButton
            className="h-auto min-h-0 p-5"
            iconSize="lg"
            onClick={() => openPlaceholder('정산 캘린더')}
            title="정산 캘린더"
          />
        </div>

        <div className={classes.weekCalendar}>
          <div className={classes.weekRow}>
            {weekDays.map((day, index) => (
              <PKText
                as="span"
                className={classes.weekDay}
                key={day}
                style={{
                  color:
                    index === 0 ? '#E22C17' : index === weekDays.length - 1 ? '#145ED9' : '#191919',
                }}
                weight={500}
              >
                {day}
              </PKText>
            ))}
          </div>
          <div className={classes.weekRow}>
            {thisWeek.map((day, index) => {
              const amount = weeklySettlementAmounts.find((item) =>
                dayjs(item.date).isSame(day, 'day'),
              )?.expectedAmount

              return (
                <div className={classes.dayCell} key={day.format('YYYYMMDD')}>
                  <PKText
                    as="span"
                    className={classes.dayText}
                    style={{
                      color:
                        index === 0 ? '#E22C17' : index === weekDays.length - 1 ? '#145ED9' : '#191919',
                    }}
                    weight={600}
                  >
                    {day.date()}
                  </PKText>
                  {amount ? (
                    <PKText as="span" className={classes.dayAmount} weight={200}>
                      {addCommasToNumber(amount)}
                    </PKText>
                  ) : null}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </PersistentBottomSheet>
  )
}

const classes = {
  sheet: 'mx-0',
  sheetBody: 'max-h-[calc(100%-72px)]',
  root: 'min-h-0 bg-white',
  toolbar: 'mb-[9px] flex items-center justify-start px-3',
  list: 'grid gap-2 px-5',
  empty:
    'm-0 py-20 text-center text-[14px] leading-[1.4] text-[#191919]',
  moreWrap:
    'flex justify-end px-5 py-[13px]',
  divider:
    'mx-5 border-b border-[#f1f3f6]',
  calendarHeader:
    'flex items-start',
  weekCalendar:
    'mx-5 grid gap-3 pb-6',
  weekRow:
    'flex justify-between',
  weekDay:
    'w-[14.2857%] text-center text-[12px] leading-[1.2]',
  dayCell:
    'grid w-[14.2857%] justify-items-center gap-1',
  dayText:
    'text-[12px] leading-[1.2]',
  dayAmount:
    'text-[8px] leading-[1.2] text-[#f09d45]',
}
