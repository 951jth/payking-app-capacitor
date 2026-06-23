import dayjs from 'dayjs'
import type { PKSelectOption } from '../components'
import type { PKRadioOption } from '../components/radio/PKRadioGroup'
import type { PaymentHistoryRangeOption } from './paymentHistory'
import type { SettlementHistoryFilter, SettlementHistorySort } from './settlementHistory'

type FilterOption<Value extends string = string> = PKRadioOption<Value>

export const SETTLEMENT_PAGE_SIZE = 20
export const SETTLEMENT_SHEET_COLLAPSED_HEIGHT = 88

export const settlementSortOptions = [
  { label: '최신순', value: 'settlementDate,DESC' },
  { label: '과거순', value: 'settlementDate,ASC' },
  { label: '고액순', value: 'price' },
] satisfies PKSelectOption<SettlementHistorySort>[]

export const settlementRangeOptions = [
  { label: '월별', value: 'month' },
  { label: '1개월', value: '1month' },
  { label: '3개월', value: '3month' },
  { label: '직접 입력', value: 'self' },
] satisfies FilterOption<PaymentHistoryRangeOption>[]

export const settlementMonthOptions = Array.from({ length: 12 }, (_, index) => {
  const month = index + 1
  return { label: `${month}월`, value: String(month) }
}) satisfies PKSelectOption<string>[]

export const settlementMonthWheelOptions = settlementMonthOptions.map((option) => ({
  label: option.label,
  value: Number(option.value),
}))

export const settlementStatusesOptions = [
  { label: '정산 예정', value: 'EXPECTED' },
  { label: '정산 완료', value: 'COMPLETED' },
  { label: '취소', value: 'UNSETTLED' },
] satisfies FilterOption[]

export function createSettlementInitFilter(): SettlementHistoryFilter {
  return {
    keyword: '',
    selectrangeOption: ['month'],
    selectedMonth: [dayjs().year(), dayjs().month() + 1],
    rangeDate: [],
    statuses: [],
  }
}

export function createSettlementYearOptions() {
  const currentYear = dayjs().year()

  return Array.from({ length: 4 }, (_, index) => {
    const year = currentYear - 3 + index
    return { label: `${year}년`, value: String(year) }
  }) satisfies PKSelectOption<string>[]
}

export function createSettlementYearWheelOptions() {
  return createSettlementYearOptions().map((option) => ({
    label: option.label,
    value: Number(option.value),
  }))
}
