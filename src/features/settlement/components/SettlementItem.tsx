import dayjs from 'dayjs'
import type { CSSProperties } from 'react'
import type { SettlementListItem } from '../../../types/settlement'
import { addCommasToNumber, formatTelephone } from '../../../utils/format'
import { PKSettlementStatusesChip } from '../../../components/custom/PKSettlementStatusesChip'
import { PKText } from '../../../components/typography/PKText'

type SettlementItemProps = {
  item: SettlementListItem
  onClick?: (item: SettlementListItem) => void
}

const payTypeToText: Record<string, string> = {
  CASH_PAY: '현금결제',
  DIRECT_LINK: '링크결제/QR결제',
  DIRECT_PAY: '카드직접결제',
  RECURRING: '정기결제',
  SAVE_LINK: '저장링크결제',
}

function formatSettlementDateChip(value?: string) {
  if (!value) return ''

  const date = dayjs(value)
  if (!date.isValid()) return ''

  const weekDay = ['일', '월', '화', '수', '목', '금', '토'][date.day()]
  return `${date.format('MM월 DD일')} ${weekDay}요일`
}

function getPaymentMetaText(item: SettlementListItem) {
  const timeText = item.settlementDate
    ? dayjs(item.settlementDate).format('HH:mm')
    : ''
  const installmentText =
    item.quotaMonths === 0 ? '일시불' : `${item.quotaMonths}개월`
  const payTypeText = item.payType
    ? `${payTypeToText[item.payType] ?? item.payType}건`
    : ''

  return [timeText, [installmentText, payTypeText].filter(Boolean).join(', ')]
    .filter(Boolean)
    .join(' | ')
}

export function SettlementItem({ item, onClick }: SettlementItemProps) {
  const hasCancelOffset = Boolean(item.settlementCancelAmount)
  const metaText = getPaymentMetaText(item)

  return (
    <button
      className={classes.item}
      onClick={() => onClick?.(item)}
      type="button"
    >
      <div className={classes.dateChipWrap}>
        <span className={classes.dateChip}>
          {formatSettlementDateChip(item.settlementDate)}
        </span>
      </div>

      <PKText
        as="p"
        className={classes.goodsName}
        style={styles.primaryText}
        weight={400}
      >
        {item.goodsName}
      </PKText>

      {item.buyerPhoneNumber ? (
        <PKText
          as="p"
          className={classes.phone}
          style={styles.primaryText}
          weight={400}
        >
          {formatTelephone(item.buyerPhoneNumber)}
        </PKText>
      ) : null}

      <PKText
        as="p"
        className={[
          classes.meta,
          item.buyerPhoneNumber ? classes.metaAfterPhone : classes.metaAfterGoods,
        ]
          .filter(Boolean)
          .join(' ')}
        style={styles.mutedText}
        weight={200}
      >
        {metaText}
      </PKText>

      {hasCancelOffset ? (
        <div className={classes.cancelBreakdown}>
          <div className={classes.amountRow}>
            <PKText
              as="span"
              className={classes.rowLabel}
              style={styles.detailText}
              weight={200}
            >
              원정산 금액
            </PKText>
            <PKText
              as="span"
              className={classes.rowAmountStrike}
              style={styles.detailText}
              weight={200}
            >
              {addCommasToNumber(item.settlementAmount)}원
            </PKText>
          </div>
          <div className={classes.amountRowCompact}>
            <PKText
              as="span"
              className={classes.rowLabel}
              style={styles.cancelText}
              weight={200}
            >
              취소금액 차감(상계)
            </PKText>
            <PKText
              as="span"
              className={classes.rowAmount}
              style={styles.cancelText}
              weight={200}
            >
              {addCommasToNumber(item.settlementCancelAmount)}원
            </PKText>
          </div>
          <div className={classes.totalRowCompact}>
            <PKText
              as="span"
              className={classes.totalLabel}
              style={styles.primaryText}
              weight={500}
            >
              총 합계
            </PKText>
            <div className={classes.totalValueWrap}>
              <PKSettlementStatusesChip status={item.settlementStatus} />
              <PKText
                as="span"
                className={classes.totalAmount}
                style={styles.primaryText}
                weight={600}
              >
                {addCommasToNumber(item.settlementRemainAmount)}원
              </PKText>
            </div>
          </div>
        </div>
      ) : (
        <div className={classes.totalRow}>
          <PKText
            as="span"
            className={classes.totalLabel}
            style={styles.primaryText}
            weight={500}
          >
            총 합계
          </PKText>
          <div className={classes.totalValueWrap}>
            <PKSettlementStatusesChip status={item.settlementStatus} />
            <PKText
              as="span"
              className={classes.totalAmount}
              style={styles.primaryText}
              weight={600}
            >
              {addCommasToNumber(item.settlementRemainAmount)}원
            </PKText>
          </div>
        </div>
      )}
    </button>
  )
}

const styles = {
  primaryText: {
    color: '#191919',
  },
  mutedText: {
    color: '#8B9099',
  },
  detailText: {
    color: '#191919',
    fontSize: 12,
  },
  cancelText: {
    color: '#E22C17',
    fontSize: 12,
  },
} satisfies Record<string, CSSProperties>

const classes = {
  item:
    'box-border grid w-full gap-0 rounded-[20px] border-0 bg-[#f1f2f5] px-6 py-[18px] text-left touch-manipulation',
  dateChipWrap: 'flex w-fit max-w-full items-start',
  dateChip:
    'inline-flex h-5 items-center justify-center rounded-[5px] bg-[#e7e9ee] px-2 font-[var(--pk-font-scd)] text-[10px] font-semibold leading-none text-[#8b9099]',
  goodsName: 'm-0 mt-3.5 block w-full text-[14px] leading-[1.3]',
  phone: 'm-0 mt-2 block w-full text-[12px] leading-[1.3]',
  meta: 'm-0 block w-full text-[12px] leading-[1.3]',
  metaAfterPhone: 'mt-1',
  metaAfterGoods: 'mt-2',
  cancelBreakdown: 'mt-2.5 grid gap-0',
  amountRow: 'mt-2.5 flex items-center justify-between gap-3',
  amountRowCompact: 'mt-1 flex items-center justify-between gap-3',
  rowLabel: 'm-0 shrink-0 text-[12px] leading-[1.3]',
  rowAmountStrike:
    'm-0 min-w-0 flex-1 truncate text-right text-[12px] leading-[1.3] line-through',
  rowAmount: 'm-0 min-w-0 flex-1 truncate text-right text-[12px] leading-[1.3]',
  totalRow: 'mt-4 flex items-center justify-between gap-3',
  totalRowCompact: 'mt-1 flex items-center justify-between gap-3',
  totalLabel: 'm-0 shrink-0 text-[14px] leading-[1.3]',
  totalValueWrap: 'flex min-w-0 flex-1 items-center justify-end gap-2',
  totalAmount: 'm-0 min-w-0 truncate text-right text-[20px] leading-[1.2]',
}
