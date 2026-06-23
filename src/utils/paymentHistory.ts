import dayjs from 'dayjs'
import type { AxiosResponse } from 'axios'
import type { ApiResponse } from '../service/axios'

export type PaymentHistoryRangeOption = 'month' | '1month' | '3month' | 'self'

export type PaymentHistoryDateRangeParams = {
  fromDate?: string
  toDate?: string
}

export function parseSearchDate(value: string) {
  return dayjs(
    `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`,
  )
}

export function formatDateRangeLabel(params: PaymentHistoryDateRangeParams | null) {
  if (!params?.fromDate || !params?.toDate) return ''

  const fromDate = parseSearchDate(params.fromDate)
  const toDate = parseSearchDate(params.toDate)
  const today = dayjs()
  const isSameToday = today.format('YYYYMMDD') === toDate.format('YYYYMMDD')
  const isSameMonth = today.format('YYYYMM') === toDate.format('YYYYMM')
  const isSameDay = fromDate.isSame(toDate, 'day')

  const fromText =
    fromDate.year() === today.year()
      ? fromDate.format('M월 D일')
      : fromDate.format('YYYY년 M월 D일')
  const toText =
    toDate.year() === today.year() && toDate.year() === fromDate.year()
      ? toDate.format('M월 D일')
      : toDate.format('YYYY년 M월 D일')

  if (isSameMonth && fromDate.date() === 1) return `${fromText} ~ 오늘`
  if (isSameDay && isSameToday) return '오늘'
  if (isSameDay && !isSameToday) return toText
  if (!isSameDay && isSameToday) return `${fromText} ~ 오늘`

  return `${fromText} ~ ${toText}`
}

export function getApiPayload<T>(response: AxiosResponse<ApiResponse<T>>): ApiResponse<T> {
  return response.data
}

export function getPaymentHistoryErrorMessage(error: unknown) {
  if (!error || typeof error !== 'object') {
    return '결제 현황을 불러오지 못했습니다.'
  }

  const maybeError = error as {
    response?: {
      data?: ApiResponse
    }
  }

  const meta = maybeError.response?.data?.meta
  return (
    meta?.userMessage ||
    meta?.systemMessage ||
    '결제 현황을 불러오지 못했습니다.'
  )
}

export function formatDateInput(value?: string) {
  if (!value) return ''

  return dayjs(value).format('YYYY-MM-DD')
}

export function getRangeDateForOption(option: PaymentHistoryRangeOption) {
  if (option === '1month') {
    return [
      dayjs().subtract(1, 'month').format('YYYY-MM-DD'),
      dayjs().format('YYYY-MM-DD'),
    ]
  }

  if (option === '3month' || option === 'self') {
    return [
      dayjs().subtract(3, 'month').format('YYYY-MM-DD'),
      dayjs().format('YYYY-MM-DD'),
    ]
  }

  return []
}
