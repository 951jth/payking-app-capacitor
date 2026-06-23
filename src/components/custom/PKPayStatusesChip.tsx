type PayStatus =
  | 'SUCCESS'
  | 'REQUEST'
  | 'REQUEST_CAN'
  | 'REQUEST_EXP'
  | 'CANCEL'
  | 'FAIL'

type CancelRequestStatus = 'REQUEST' | 'COMPLETE' | 'CANCEL'

type PKPayStatusesChipProps = {
  payStatuses?: string
  cancelRequestStatus?: string
}

type StatusStyle = {
  label: string
  backgroundColor: string
  color: string
}

const payStatusesObject: Record<PayStatus, StatusStyle> = {
  SUCCESS: {
    label: '완료',
    backgroundColor: '#DBE8FF',
    color: '#145ED9',
  },
  REQUEST: {
    label: '결제 요청',
    backgroundColor: '#FFEABC',
    color: '#E59D00',
  },
  REQUEST_CAN: {
    label: '결제요청 취소',
    backgroundColor: '#FFEABC',
    color: '#E59D00',
  },
  REQUEST_EXP: {
    label: '결제요청 만료',
    backgroundColor: '#FFEABC',
    color: '#E59D00',
  },
  CANCEL: {
    label: '취소',
    backgroundColor: '#FEDBDB',
    color: '#E22C17',
  },
  FAIL: {
    label: '오류',
    backgroundColor: '#FEDBDB',
    color: '#E22C17',
  },
}

const cancelRequestStatusObject: Record<
  CancelRequestStatus,
  StatusStyle
> = {
  REQUEST: {
    label: '취소 요청',
    backgroundColor: '#FEDBDB',
    color: '#E22C17',
  },
  COMPLETE: {
    label: '취소 요청 완료',
    backgroundColor: '#FEDBDB',
    color: '#E22C17',
  },
  CANCEL: {
    label: '취소 요청 취소',
    backgroundColor: '#FEDBDB',
    color: '#E22C17',
  },
}

function isPayStatus(value?: string): value is PayStatus {
  return Boolean(value && value in payStatusesObject)
}

function isCancelRequestStatus(value?: string): value is CancelRequestStatus {
  return Boolean(value && value in cancelRequestStatusObject)
}

export function PKPayStatusesChip({
  payStatuses,
  cancelRequestStatus,
}: PKPayStatusesChipProps) {
  const status = isCancelRequestStatus(cancelRequestStatus)
    ? cancelRequestStatusObject[cancelRequestStatus]
    : isPayStatus(payStatuses)
      ? payStatusesObject[payStatuses]
      : null

  if (!status) return null

  const style = {
    backgroundColor: status.backgroundColor,
    color: status.color,
  } satisfies CSSProperties

  return (
    <span className={classes.chip} style={style}>
      {status.label}
    </span>
  )
}

const classes = {
  chip:
    'inline-flex h-5 items-center justify-center rounded-[5px] px-2 font-[var(--pk-font-scd)] text-[10px] font-semibold leading-none',
}
import type { CSSProperties } from 'react'
