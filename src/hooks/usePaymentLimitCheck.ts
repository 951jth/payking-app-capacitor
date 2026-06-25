import payments from '../service/payments'
import { alertStore } from '../stores/alertStore'
import { addCommasToNumber } from '../utils/format'

type PayLimitSummary = {
  agentStatus?: string
  giStatus?: string
  isPayNotPossible?: boolean
  isOncePayOverLimit?: boolean
  isDailyPayOverLimit?: boolean
  isMonthlyPayOverLimit?: boolean
  isGiPayOverLimit?: boolean
  oncePayLimit?: number
  dailyPayLimit?: number
  monthlyPayLimit?: number
}

type PayLimitResponse = {
  payLimitSummary?: PayLimitSummary
} & PayLimitSummary

function getPayLimitErrorMessage(error: unknown) {
  if (typeof error === 'string') return error

  if (!error || typeof error !== 'object') return '서버 오류'

  const maybeError = error as {
    response?: {
      data?: {
        meta?: {
          systemMessage?: string
          userMessage?: string
        }
      }
    }
  }

  return (
    maybeError.response?.data?.meta?.userMessage ||
    maybeError.response?.data?.meta?.systemMessage ||
    '서버 오류'
  )
}

function getLimitMessage(result: PayLimitSummary) {
  return `결제한도를 넘으셨어요.\n\n1회 결제 한도 : ${addCommasToNumber(
    result.oncePayLimit || 0,
  )}원\n1일 결제 한도 : ${addCommasToNumber(
    result.dailyPayLimit || 0,
  )}원\n월 결제 한도 : ${addCommasToNumber(
    result.monthlyPayLimit,
  )}원\n\n문의사항은 페이킹으로 편하게 연락주세요.`
}

function isPayLimitPass(result: PayLimitSummary) {
  return (
    result.agentStatus === 'IN_USE' &&
    !result.isPayNotPossible &&
    !result.isOncePayOverLimit &&
    !result.isDailyPayOverLimit &&
    !result.isMonthlyPayOverLimit &&
    !result.isGiPayOverLimit
  )
}

function showPayLimitAlert(
  result: PayLimitSummary,
  showAlert: ReturnType<typeof alertStore>['showAlert'],
) {
  if (
    result.isOncePayOverLimit ||
    result.isDailyPayOverLimit ||
    result.isMonthlyPayOverLimit
  ) {
    showAlert({
      title: '결제한도 초과',
      contents: getLimitMessage(result),
    })
    return
  }

  if (result.isGiPayOverLimit) {
    showAlert({
      title: '한도 초과',
      contents:
        '이번 달 결제 한도를 넘으셨어요.\n보증보험 한도를 올리시면 다시 이용하실 수 있습니다.\n추가 문의는 페이킹으로 편하게 연락주세요.',
    })
    return
  }

  if (result.giStatus === 'EXPIRED' && result.isPayNotPossible) {
    showAlert({
      title: '결제불가',
      contents: '사유 : 보증보험 만료\n\n자세한 내용은 페이킹으로 문의해주세요.',
    })
    return
  }

  if (result.agentStatus !== 'IN_USE' || result.isPayNotPossible) {
    showAlert({
      title: '결제불가',
      contents: '사유 : 결제 정지\n\n자세한 내용은 페이킹으로 문의해주세요.',
    })
  }
}

function getResponseData<T>(response: { data?: { data?: T } }) {
  return response.data?.data
}

export default function usePaymentLimitCheck() {
  const showAlert = alertStore((state) => state.showAlert)

  async function paymentLimitCheck(
    agentId: string | number | undefined,
    totalPayAmount: number,
  ) {
    try {
      const response = await payments.getPayLimitSummary({
        agentId,
        totalPayAmount,
      })
      const result = getResponseData<PayLimitSummary>(response) ?? {}

      if (isPayLimitPass(result)) return true

      showPayLimitAlert(result, showAlert)
      return false
    } catch (error) {
      showAlert({
        title: '서버 오류',
        contents: getPayLimitErrorMessage(error),
      })
      return false
    }
  }

  async function getCheckPayLimit(
    agentId: string | number | undefined,
    totalPayAmount: number,
  ) {
    try {
      const response = await payments.getCheckPayLimit({
        agentId,
        totalPayAmount,
      })
      const data = getResponseData<PayLimitResponse>(response)
      const result = data?.payLimitSummary ?? data ?? {}

      if (isPayLimitPass(result)) return true

      showPayLimitAlert(result, showAlert)
      return false
    } catch (error) {
      showAlert({
        title: '서버 오류',
        contents: getPayLimitErrorMessage(error),
      })
      return false
    }
  }

  return { paymentLimitCheck, getCheckPayLimit }
}
