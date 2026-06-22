import { PKText } from '../../components'
import type { GuaranteeInsurances } from '../../stores/userStore'
import { addCommasToNumber, percent } from '../../utils/format'

type HomeSettlementSectionProps = {
  todayAmount: number
  guaranteeInsurances: GuaranteeInsurances | null
}

export function HomeSettlementSection({
  todayAmount,
  guaranteeInsurances,
}: HomeSettlementSectionProps) {
  const totalPayLimit = guaranteeInsurances?.totalPayLimit ?? 0
  const usedAmount = guaranteeInsurances?.usedAmount ?? 0
  const isUnlimited = totalPayLimit === 0
  const progressWidth = isUnlimited
    ? 100
    : percent(usedAmount, totalPayLimit, 2)
  const remainingAmount = isUnlimited
    ? '무제한'
    : `${addCommasToNumber(totalPayLimit - usedAmount)}${guaranteeInsurances?.status === 'EXPIRED' ? '(만료)' : ''}`

  return (
    <section className={classes.section}>
      <div className={classes.todayRow}>
        <PKText as="p" className={classes.todayLabel} weight={400}>
          오늘 정산 예정 금액
        </PKText>
        <PKText as="p" className={classes.todayAmount} weight={600}>
          {addCommasToNumber(todayAmount)}원
        </PKText>
      </div>

      <div className={classes.limitBlock}>
        <PKText as="p" className={classes.limitLabel} weight={400}>
          보증보험 한도
        </PKText>
        <div className={classes.progressTrack}>
          <div
            className={classes.progressFill}
            style={{ width: `${Math.min(progressWidth, 100)}%` }}
          />
        </div>
        <div className={classes.limitMeta}>
          <div className={classes.limitMetaItem}>
            <PKText as="span" className={classes.limitMetaLabel} weight={400}>
              사용 금액
            </PKText>
            <PKText as="span" className={classes.limitMetaValue} weight={400}>
              {addCommasToNumber(usedAmount)}
            </PKText>
          </div>
          <div className={classes.limitMetaItem}>
            <PKText as="span" className={classes.limitMetaMuted} weight={400}>
              남은 금액
            </PKText>
            <PKText as="span" className={classes.limitMetaMuted} weight={400}>
              {remainingAmount}
            </PKText>
          </div>
        </div>
      </div>
    </section>
  )
}

const classes = {
  section: 'grid gap-[13px]',
  todayRow: 'flex items-center justify-between',
  todayLabel: 'm-0 text-[14px] leading-[1.2] text-[#191919]',
  todayAmount: 'm-0 text-[20px] leading-[1.2] text-[#191919]',
  limitBlock: 'grid gap-[6px]',
  limitLabel: 'm-0 text-[12px] leading-[1.2] text-[#191919]',
  progressTrack: 'h-[12px] w-full overflow-hidden rounded-[6px] bg-[#e7e9ee]',
  progressFill: 'h-[12px] rounded-[6px] bg-[#145ed9]',
  limitMeta: 'flex items-center justify-between',
  limitMetaItem: 'flex items-center gap-[4px]',
  limitMetaLabel: 'text-[10px] leading-[1.2] text-[#1e1e1e]',
  limitMetaValue: 'text-[10px] leading-[1.2] text-[#1e1e1e]',
  limitMetaMuted: 'text-[10px] leading-[1.2] text-[#afb8c5]',
}
