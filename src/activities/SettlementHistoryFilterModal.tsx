import {
  BottomModal,
  PKButton,
  PKSearchInput,
  PKText,
  PKRadioGroup,
  PKBottomWheelPicker,
  PKRangeDatePicker,
} from '../components'
import type { PaymentHistoryRangeOption } from '../utils/paymentHistory'
import type { SettlementHistoryFilter } from '../utils/settlementHistory'
import {
  createSettlementYearWheelOptions,
  settlementMonthWheelOptions,
  settlementRangeOptions,
  settlementStatusesOptions,
} from '../utils/settlementHistory.constants'

export type SettlementHistoryFilterModalProps = {
  visible: boolean
  modalFilter: SettlementHistoryFilter
  onClose: () => void
  onApply: () => void
  onUpdateFilter: <Key extends keyof SettlementHistoryFilter>(
    key: Key,
    value: SettlementHistoryFilter[Key],
  ) => void
  onRangeOptionChange: (value: PaymentHistoryRangeOption[] | null) => void
}

const yearWheelOptions = createSettlementYearWheelOptions()

export function SettlementHistoryFilterModal({
  visible,
  modalFilter,
  onClose,
  onApply,
  onUpdateFilter,
  onRangeOptionChange,
}: SettlementHistoryFilterModalProps) {
  const isMonthRange = modalFilter.selectrangeOption.includes('month')
  const isFixedRange =
    modalFilter.selectrangeOption.includes('1month') ||
    modalFilter.selectrangeOption.includes('3month')

  return (
    <BottomModal useScrollView={false} title="필터 검색" visible={visible} onClose={onClose}>
      <div className={classes.sheet}>
        <div className={classes.scroll}>
          <PKSearchInput
            onChangeText={(value) => onUpdateFilter('keyword', value)}
            placeholder="휴대폰번호, 상품명, 금액"
            value={modalFilter.keyword}
          />

          <div className={classes.section}>
            <PKText as="p" className={classes.label} weight={200}>
              이용 기간
            </PKText>
            <PKRadioGroup
              multiple={false}
              onChange={onRangeOptionChange}
              options={settlementRangeOptions}
              value={modalFilter.selectrangeOption}
            />
            {isMonthRange ? (
              <PKBottomWheelPicker
                onChange={(value) =>
                  onUpdateFilter('selectedMonth', value as SettlementHistoryFilter['selectedMonth'])
                }
                options={[yearWheelOptions, settlementMonthWheelOptions]}
                pickerTitle="월 선택"
                placeholder="월을 선택해주세요."
                value={modalFilter.selectedMonth}
              />
            ) : (
              <PKRangeDatePicker
                disabled={isFixedRange}
                format="YY/M/D"
                onChange={(value) => onUpdateFilter('rangeDate', value)}
                placeholder="연도/월/일"
                value={modalFilter.rangeDate}
              />
            )}
          </div>

          <div className={classes.section}>
            <PKText as="p" className={classes.label} weight={200}>
              정산 상태
            </PKText>
            <PKRadioGroup
              onChange={(value) => onUpdateFilter('statuses', value ?? [])}
              options={settlementStatusesOptions}
              value={modalFilter.statuses}
            />
          </div>
        </div>

        <div className={classes.actions}>
          <PKButton
            type="standard"
            colorType="solid-primary"
            onClick={onApply}
            title="적용"
          />
        </div>
      </div>
    </BottomModal>
  )
}

const classes = {
  sheet: 'flex max-h-[calc(100svh-132px)] min-h-0 flex-col',
  scroll:
    'grid min-h-0 flex-1 gap-4 overflow-y-auto px-5 pb-4 pt-3 [-webkit-overflow-scrolling:touch]',
  actions:
    'shrink-0 border-t border-[#eef1f5] bg-white px-5 pb-[calc(16px+env(safe-area-inset-bottom))] pt-3',
  section: 'grid gap-2',
  label: 'm-0 text-[14px] leading-[1.2] text-[#191919]',
}
