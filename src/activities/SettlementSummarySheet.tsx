import { useCallback, useEffect, useState } from 'react'
import { PersistentBottomSheet, PKText } from '../components'
import type { PersistentBottomSheetState } from '../components'
import settlement from '../service/settlement'
import { useAlertStore } from '../stores/alertStore'
import type { SettlementStatusAmountStat } from '../types/settlement'
import { addCommasToNumber } from '../utils/format'
import { getApiPayload } from '../utils/paymentHistory'
import {
  getSettlementHistoryErrorMessage,
  sumSettlementAmountByStatus,
  type SettlementSearchParams,
} from '../utils/settlementHistory'
import { removeEmpty } from '../utils/removeEmpty'
import { SETTLEMENT_SHEET_COLLAPSED_HEIGHT } from '../utils/settlementHistory.constants'

export type SettlementSummarySheetProps = {
  searchParams: SettlementSearchParams | null
  reloadSignal?: number
}

export function SettlementSummarySheet({
  searchParams,
  reloadSignal = 0,
}: SettlementSummarySheetProps) {
  const showAlert = useAlertStore((state) => state.showAlert)
  const [sheetState, setSheetState] =
    useState<PersistentBottomSheetState>('collapsed')
  const [scheduledAmount, setScheduledAmount] = useState(0)
  const [completePayAmount, setCompletePayAmount] = useState(0)
  const [loading, setLoading] = useState(true)

  const loadSummaryStats = useCallback(async () => {
    if (!searchParams?.fromDate || !searchParams?.toDate) {
      setLoading(false)
      return
    }

    setLoading(true)

    try {
      const response = await settlement.getMySettlementStatusAmountStats(
        removeEmpty({
          keyword: searchParams.keyword,
          statuses: searchParams.statuses,
          searchDateType: searchParams.searchDateType,
          fromDate: searchParams.fromDate,
          toDate: searchParams.toDate,
        }),
      )
      const payload = getApiPayload<SettlementStatusAmountStat[]>(response)
      const stats = Array.isArray(payload.data) ? payload.data : []

      setScheduledAmount(sumSettlementAmountByStatus(stats, 'EXPECTED'))
      setCompletePayAmount(sumSettlementAmountByStatus(stats, 'COMPLETED'))
    } catch (error) {
      showAlert({
        title: '정산 현황',
        contents: getSettlementHistoryErrorMessage(error),
      })
    } finally {
      setLoading(false)
    }
  }, [searchParams, showAlert])

  useEffect(() => {
    void loadSummaryStats()
  }, [loadSummaryStats, reloadSignal])

  if (loading) return null

  const totalAmount = scheduledAmount + completePayAmount

  return (
    <PersistentBottomSheet
      bodyClassName={classes.body}
      className={classes.root}
      collapsedHeight={SETTLEMENT_SHEET_COLLAPSED_HEIGHT}
      maxHeight="52%"
      onStateChange={setSheetState}
      state={sheetState}
      title={
        <div className={classes.titleRow}>
          <PKText as="span" className={classes.titleLabel} weight={500}>
            합계
          </PKText>
          <PKText as="span" className={classes.titleAmount} weight={600}>
            {addCommasToNumber(totalAmount)}원
          </PKText>
        </div>
      }
    >
      <div className={classes.breakdown}>
        <SummaryRow label="정산 예정" value={scheduledAmount} />
        <SummaryRow label="정산 완료" value={completePayAmount} />
      </div>
    </PersistentBottomSheet>
  )
}

function SummaryRow({ label, value }: { label: string; value: number }) {
  return (
    <div className={classes.breakdownRow}>
      <PKText as="span" className={classes.breakdownLabel} weight={400}>
        {label}
      </PKText>
      <PKText as="span" className={classes.breakdownValue} weight={400}>
        {addCommasToNumber(value)}원
      </PKText>
    </div>
  )
}

const classes = {
  root: 'mx-0',
  body: 'max-h-[calc(100%-88px)]',
  titleRow: 'flex w-full items-center justify-between px-6 pb-1 pt-0',
  titleLabel: 'text-[16px] leading-[1.2] text-[#191919]',
  titleAmount: 'text-[24px] leading-[1.2] text-[#191919]',
  breakdown: 'mx-5 grid gap-3 border-b border-[#e7e9ee] py-4',
  breakdownRow: 'flex items-center justify-between gap-3 px-1',
  breakdownLabel: 'text-[14px] leading-[1.2] text-[#191919]',
  breakdownValue: 'text-[14px] leading-[1.2] text-[#191919]',
}
