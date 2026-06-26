import dayjs from 'dayjs'
import type { CSSProperties } from 'react'
import { addCommasToNumber, formatTelephone } from '../../../utils/format'
import { PKPayStatusesChip } from '../../../components/custom/PKPayStatusesChip'
import { PKText } from '../../../components/typography/PKText'

export type PaymentListItem = {
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
    payAmount?: number
    partCultPercent?: number
  }>
}

type PaymentItemProps = {
  item: PaymentListItem
  onClick?: (item: PaymentListItem) => void
  isGotoDetail?: boolean
}

const payTypeToText: Record<string, string> = {
  CASH_PAY: '현금결제',
  DIRECT_LINK: '링크결제/QR결제',
  DIRECT_PAY: '카드직접결제',
  RECURRING: '정기결제',
  SAVE_LINK: '저장링크결제',
}

function formatStatusDate(value?: string) {
  if (!value) return ''

  const date = dayjs(value)
  if (!date.isValid()) return ''

  const weekDay = ['일', '월', '화', '수', '목', '금', '토'][date.day()]
  return `${date.format('MM월 DD일')} ${weekDay}요일 ${date.format('HH:mm')}`
}

function getInstallmentText(item: PaymentListItem) {
  const quotaMonths = item.transactions?.[0]?.quotaMonths ?? 0
  const installmentText = quotaMonths === 0 ? '일시불' : `${quotaMonths}개월 할부`
  const payTypeText = item.payType ? payTypeToText[item.payType] : ''

  return [installmentText, payTypeText].filter(Boolean).join(', ')
}

function TransactionRows({ item }: { item: PaymentListItem }) {
  const transactions = item.transactions ?? []
  const shouldShowTransactions =
    transactions.length > 1 ||
    (transactions.length === 1 && transactions[0]?.taxDeductType !== 'NORMAL')

  if (!shouldShowTransactions) return null

  return (
    <div className={classes.transactions} style={styles.transactionBorder}>
      {transactions.map((transaction, index) => {
        const label =
          transaction?.taxDeductType === 'NORMAL'
            ? '일반결제'
            : `문화비소득공제(${
                (transaction?.partCultPercent ?? 0) > 0
                  ? `${transaction?.partCultPercent}%적용`
                  : '전체적용'
              })`

        return (
          <div className={classes.transactionRow} key={transaction.id ?? index}>
            <div className={classes.transactionInfo}>
              <PKText
                as="p"
                className={classes.transactionTitle}
                style={styles.primaryText}
                weight={500}
              >
                {label}
              </PKText>
              <PKText
                as="p"
                className={classes.transactionAmount}
                style={styles.primaryText}
                weight={400}
              >
                {addCommasToNumber(transaction?.payAmount)}원
              </PKText>
            </div>
            <PKPayStatusesChip
              cancelRequestStatus={item.cancelRequestStatus}
              payStatuses={transaction?.transactionStatus}
            />
          </div>
        )
      })}
    </div>
  )
}

export function PaymentItem({
  item,
  onClick,
  isGotoDetail = true,
}: PaymentItemProps) {
  const Wrapper = isGotoDetail && onClick ? 'button' : 'article'
  const clickableProps =
    Wrapper === 'button'
      ? {
          onClick: () => onClick?.(item),
          type: 'button' as const,
        }
      : {}

  return (
    <Wrapper className={classes.wrapper} style={styles.wrapper} {...clickableProps}>
      <PKText as="p" className={classes.date} style={styles.mutedText} weight={500}>
        {formatStatusDate(item.statusDate)}
      </PKText>

      <div className={classes.body}>
        <div className={classes.info}>
          <PKText as="p" className={classes.goodsName} style={styles.primaryText} weight={500}>
            {item.goodsName || '-'}
          </PKText>
          {item.buyerPhoneNumber && (
            <PKText as="p" className={classes.phone} style={styles.primaryText} weight={400}>
              {formatTelephone(item.buyerPhoneNumber)}
            </PKText>
          )}
          <PKText as="p" className={classes.meta} style={styles.mutedText} weight={400}>
            {getInstallmentText(item)}
          </PKText>
        </div>

        <div className={classes.amountWrap}>
          <PKText as="p" className={classes.amount} style={styles.primaryText} weight={600}>
            {addCommasToNumber(item.totalPayAmount)}원
          </PKText>
          {item.transactions?.length === 1 &&
            item.transactions?.[0]?.taxDeductType === 'NORMAL' && (
              <PKPayStatusesChip
                cancelRequestStatus={item.cancelRequestStatus}
                payStatuses={item.status}
              />
            )}
        </div>
      </div>

      <TransactionRows item={item} />
    </Wrapper>
  )
}

const classes = {
  wrapper:
    'box-border grid w-full gap-3 rounded-[10px] border-0 p-4 text-left',
  date:
    'm-0 truncate text-[12px] leading-[1.2]',
  body:
    'flex justify-between gap-3',
  info:
    'grid min-w-0 flex-1 gap-2',
  goodsName:
    'm-0 truncate text-[14px] leading-[1.25]',
  phone:
    'm-0 truncate text-[12px] leading-[1.2]',
  meta:
    'm-0 truncate text-[12px] leading-[1.2]',
  amountWrap:
    'grid shrink-0 justify-items-end gap-1',
  amount:
    'm-0 truncate text-[20px] leading-[1.2]',
  transactions:
    'ml-1 grid gap-4 border-l py-2 pl-3',
  transactionRow:
    'flex justify-between gap-3',
  transactionInfo:
    'grid gap-[7px]',
  transactionTitle:
    'm-0 text-[12px] leading-[1.2]',
  transactionAmount:
    'm-0 text-[12px] leading-[1.2]',
}

const styles = {
  wrapper: {
    backgroundColor: '#F1F2F5',
  },
  primaryText: {
    color: '#191919',
  },
  mutedText: {
    color: '#8B9099',
  },
  transactionBorder: {
    borderColor: '#8B9099',
  },
} satisfies Record<string, CSSProperties>
