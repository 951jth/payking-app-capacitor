import dayjs from 'dayjs'
import type { PaymentHistoryRangeOption } from './paymentHistory'
import { removeEmpty } from './removeEmpty'

export type SettlementHistoryFilter = {
  keyword: string
  selectrangeOption: PaymentHistoryRangeOption[]
  selectedMonth: [number, number]
  rangeDate: string[]
  statuses: string[]
}

export type SettlementHistorySort = 'settlementDate,DESC' | 'settlementDate,ASC' | 'price'

export type SettlementSearchParams = {
  keyword?: string
  statuses?: string | string[]
  page?: number
  size?: number
  sort?: SettlementHistorySort | string[]
  searchDateType?: 'SETTLED'
  fromDate?: string
  toDate?: string
}

function getDateRangeParams(filter: SettlementHistoryFilter) {
  if (filter.selectrangeOption.includes('month')) {
    const [year, month] = filter.selectedMonth
    const currentMonth = dayjs().year(year).month(month - 1)

    return {
      fromDate: currentMonth.startOf('month').format('YYYYMMDD'),
      toDate: currentMonth.endOf('month').format('YYYYMMDD'),
    }
  }

  if (filter.rangeDate.length < 2 || !filter.rangeDate[0] || !filter.rangeDate[1]) {
    return null
  }

  return {
    fromDate: dayjs(filter.rangeDate[0]).format('YYYYMMDD'),
    toDate: dayjs(filter.rangeDate[1]).format('YYYYMMDD'),
  }
}

export function getSettlementHistoryParams({
  filter,
  sort,
  page = 0,
}: {
  filter: SettlementHistoryFilter
  sort: SettlementHistorySort
  page?: number
}) {
  const dateParams = getDateRangeParams(filter)
  if (!dateParams) return null

  const params: SettlementSearchParams = {
    keyword: filter.keyword,
    statuses: filter.statuses.toString(),
    page,
    size: 20,
    searchDateType: 'SETTLED',
    sort: sort === 'price' ? ['payAmount,DESC', 'settlementDate,DESC'] : sort,
    ...dateParams,
  }

  return removeEmpty(params)
}

export function getSettlementHistoryErrorMessage(error: unknown) {
  if (!error || typeof error !== 'object') {
    return '정산 현황을 불러오지 못했습니다.'
  }

  const maybeError = error as {
    response?: {
      data?: {
        meta?: {
          userMessage?: string
          systemMessage?: string
        }
      }
    }
  }

  const meta = maybeError.response?.data?.meta
  return (
    meta?.userMessage ||
    meta?.systemMessage ||
    '정산 현황을 불러오지 못했습니다.'
  )
}

export function sumSettlementAmountByStatus<
  T extends { status?: string; totalAmount?: number },
>(stats: T[], status: string) {
  return stats.reduce((acc, item) => {
    if (item.status === status) {
      return acc + Number(item.totalAmount ?? 0)
    }

    return acc
  }, 0)
}
