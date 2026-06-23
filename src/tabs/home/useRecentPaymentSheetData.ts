import { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import paymentsService from '../../service/payments'
import settlementService from '../../service/settlement'
import type { ApiResponse } from '../../service/axios'
import { useSessionStore } from '../../stores/sessionStore'

export type RecentPaymentSort = 'statusDate,DESC' | 'statusDate,ASC'

export type RecentPaymentItem = {
  id?: string | number
  statusDate?: string
  goodsName?: string
  buyerPhoneNumber?: string
  totalPayAmount?: number
  status?: string
  cancelRequestStatus?: string
  payType?: string
  transactions?: Array<{
    id?: string | number
    quotaMonths?: number
    taxDeductType?: string
    transactionStatus?: string
  }>
}

export type WeeklySettlementAmount = {
  date: string
  expectedAmount: number
}

function getApiData<T>(response: { data?: unknown }): T | null {
  const payload = response.data as ApiResponse<T> | undefined
  if (payload?.data !== undefined && payload?.data !== null) {
    return payload.data as T
  }

  return null
}

export function useRecentPaymentSheetData() {
  const accessToken = useSessionStore((state) => state.accessToken)
  const [sort, setSort] = useState<RecentPaymentSort>('statusDate,DESC')
  const [payments, setPayments] = useState<RecentPaymentItem[]>([])
  const [weeklySettlementAmounts, setWeeklySettlementAmounts] = useState<
    WeeklySettlementAmount[]
  >([])

  useEffect(() => {
    if (!accessToken) return

    let ignore = false

    void paymentsService
      .getMyPaymentSearch({
        fromDate: dayjs().subtract(1, 'month').format('YYYYMMDD'),
        toDate: dayjs().format('YYYYMMDD'),
        paySearchDateType: 'LAST_STATE',
        page: 0,
        size: 10,
        sort,
      })
      .then((response) => {
        if (ignore) return

        setPayments(getApiData<RecentPaymentItem[]>(response) ?? [])
      })
      .catch((error) => {
        if (!ignore) {
          console.warn('최근 결제 내역 조회 실패:', error)
          setPayments([])
        }
      })

    return () => {
      ignore = true
    }
  }, [accessToken, sort])

  useEffect(() => {
    if (!accessToken) return

    let ignore = false

    void settlementService
      .getMySettlementStatusDailyAmount({
        searchDateType: 'SETTLED',
        fromDate: dayjs().startOf('week').format('YYYYMMDD'),
        toDate: dayjs().endOf('week').format('YYYYMMDD'),
      })
      .then((response) => {
        if (ignore) return

        const stats =
          getApiData<
            Array<{
              unitDate?: string
              statusStats?: {
                EXPECTED?: {
                  totalAmount?: number
                }
              }
            }>
          >(response) ?? []

        setWeeklySettlementAmounts(
          stats.map((item) => ({
            date: item.unitDate ?? '',
            expectedAmount: item.statusStats?.EXPECTED?.totalAmount ?? 0,
          })),
        )
      })
      .catch((error) => {
        if (!ignore) {
          console.warn('주간 정산 금액 조회 실패:', error)
          setWeeklySettlementAmounts([])
        }
      })

    return () => {
      ignore = true
    }
  }, [accessToken])

  return {
    sort,
    setSort,
    payments,
    weeklySettlementAmounts,
  }
}
