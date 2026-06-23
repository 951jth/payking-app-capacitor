import type { CSSProperties } from 'react'
import type { SettlementStatus } from '../../types/settlement'

type PKSettlementStatusesChipProps = {
  status?: SettlementStatus | string
}

type StatusStyle = {
  label: string
  backgroundColor: string
  color: string
}

const settlementStatusStyles: Record<SettlementStatus, StatusStyle> = {
  EXPECTED: {
    label: '정산 예정',
    backgroundColor: '#E7E9EE',
    color: '#8B9099',
  },
  COMPLETED: {
    label: '정산 완료',
    backgroundColor: '#DBE8FF',
    color: '#145ED9',
  },
  UNSETTLED: {
    label: '취소',
    backgroundColor: '#FEDBDB',
    color: '#E22C17',
  },
}

function isSettlementStatus(value?: string): value is SettlementStatus {
  return Boolean(value && value in settlementStatusStyles)
}

export function PKSettlementStatusesChip({ status }: PKSettlementStatusesChipProps) {
  if (!isSettlementStatus(status)) return null

  const current = settlementStatusStyles[status]
  const style = {
    backgroundColor: current.backgroundColor,
    color: current.color,
  } satisfies CSSProperties

  return (
    <span className={classes.chip} style={style}>
      {current.label}
    </span>
  )
}

const classes = {
  chip:
    'inline-flex h-5 shrink-0 items-center justify-center rounded-[5px] px-2 font-[var(--pk-font-scd)] text-[10px] font-semibold leading-none',
}
