import dayjs from 'dayjs'
import { LoaderCircle, RefreshCcw } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import iconFilter from '../assets/icons/Icon_filter.svg'
import { PKIconButton, PKSelect, PKText } from '../components'
import settlement from '../service/settlement'
import { useAlertStore } from '../stores/alertStore'
import type { SettlementStatusAmountStat } from '../types/settlement'
import { addCommasToNumber } from '../utils/format'
import { getApiPayload } from '../utils/paymentHistory'
import {
  getSettlementHistoryErrorMessage,
  type SettlementHistorySort,
} from '../utils/settlementHistory'
import { settlementSortOptions } from '../utils/settlementHistory.constants'

export type SettlementHistorySummaryProps = {
  settlementPeriod: number
  totalCount: number
  sort: SettlementHistorySort
  listLoading: boolean
  loadingMore: boolean
  onSortChange: (value: SettlementHistorySort) => void
  onRefresh: () => void
  onOpenFilter: () => void
}

export function SettlementHistorySummary({
  settlementPeriod,
  totalCount,
  sort,
  listLoading,
  loadingMore,
  onSortChange,
  onRefresh,
  onOpenFilter,
}: SettlementHistorySummaryProps) {
  const showAlert = useAlertStore((state) => state.showAlert)
  const [todayAmount, setTodayAmount] = useState(0)
  const [todayLoading, setTodayLoading] = useState(true)

  const loadTodayAmount = useCallback(async () => {
    setTodayLoading(true)

    try {
      const response = await settlement.getMySettlementStatusAmountStats({
        searchDateType: 'SETTLED',
        statuses: ['EXPECTED', 'COMPLETED'],
        fromDate: dayjs().format('YYYYMMDD'),
        toDate: dayjs().format('YYYYMMDD'),
      })
      const payload = getApiPayload<SettlementStatusAmountStat[]>(response)
      const stats = Array.isArray(payload.data) ? payload.data : []
      const totalAmount = stats.reduce(
        (acc, item) => acc + Number(item.totalAmount ?? 0),
        0,
      )

      setTodayAmount(totalAmount)
    } catch (error) {
      showAlert({
        title: '정산 현황',
        contents: getSettlementHistoryErrorMessage(error),
      })
    } finally {
      setTodayLoading(false)
    }
  }, [showAlert])

  useEffect(() => {
    void loadTodayAmount()
  }, [loadTodayAmount])

  const handleRefresh = () => {
    void loadTodayAmount()
    onRefresh()
  }

  return (
    <section className={classes.summary}>
      <div className={classes.todayHeader}>
        <PKText as="p" className={classes.todayLabel} weight={400}>
          오늘 정산 금액
        </PKText>
        <span className={classes.periodChip}>
          <PKText as="span" className={classes.periodLabel} weight={200}>
            정산주기{' '}
            <PKText as="span" className={classes.periodValue} weight={600}>
              D+{settlementPeriod}
            </PKText>
          </PKText>
        </span>
      </div>

      {todayLoading ? (
        <div aria-hidden className={classes.todayAmountLoading}>
          <LoaderCircle className={classes.spinnerPrimary} size={28} />
        </div>
      ) : (
        <PKText as="p" className={classes.todayAmount} weight={600}>
          {addCommasToNumber(todayAmount)}원
        </PKText>
      )}

      <div className={classes.toolbar}>
        <PKText as="p" className={classes.totalCount} weight={400}>
          총 {totalCount}건
        </PKText>
        <div className={classes.toolbarActions}>
          <PKSelect
            onChange={onSortChange}
            options={settlementSortOptions}
            value={sort}
          />
          <PKIconButton
            aria-label="정산 내역 새로고침"
            disabled={listLoading || loadingMore}
            icon={
              <RefreshCcw
                className={listLoading ? classes.refreshIconLoading : ''}
                size={18}
              />
            }
            onClick={handleRefresh}
          />
          <PKIconButton
            aria-label="필터 검색"
            icon={<img alt="" className={classes.filterIcon} src={iconFilter} />}
            onClick={onOpenFilter}
          />
        </div>
      </div>
    </section>
  )
}

const classes = {
  summary:
    'mx-0 shrink-0 border-0 border-b border-solid border-b-[#1e1e1e] px-1 pb-4',
  todayHeader: 'mb-1 flex flex-wrap items-center gap-2 px-1',
  todayLabel: 'm-0 text-[14px] leading-[1.2] text-[#191919]',
  periodChip:
    'inline-flex h-6 items-center justify-center rounded-2xl bg-[#e7e9ee] px-2.5',
  periodLabel: 'm-0 text-[10px] leading-none text-[#191919]',
  periodValue: 'text-[12px] leading-none text-[#191919]',
  todayAmount:
    'm-0 px-1 pb-4 text-[32px] leading-[1.18] tracking-normal text-[#191919]',
  todayAmountLoading:
    'flex h-[38px] items-center px-1 pb-4 text-[var(--pk-primary)]',
  spinnerPrimary: 'animate-spin',
  toolbar: 'flex flex-wrap items-center justify-between gap-2 pb-0.5',
  totalCount: 'm-0 shrink-0 text-[14px] leading-[1.2] text-[#191919]',
  toolbarActions: 'ml-auto flex min-w-0 shrink-0 items-center justify-center gap-0',
  refreshIconLoading: 'animate-spin',
  filterIcon: 'h-5 w-5',
}
