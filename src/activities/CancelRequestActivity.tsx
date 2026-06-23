import type { ActivityComponentType } from '@stackflow/react'
import { useActivityParams } from '@stackflow/react'
import { LoaderCircle } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import {
  AppContainer,
  AppHeader,
  PKButton,
  PKConfirm,
  PKInput,
  PKText,
} from '../components'
import { useAppNavigation } from '../navigation/useAppNavigation'
import payments from '../service/payments'
import standard from '../service/standard'
import { useAlertStore } from '../stores/alertStore'
import { useUserStore } from '../stores/userStore'
import type { CancelRequestDeposit, PaymentDetail } from '../types/payment'
import { addCommasToNumber, formatTelephone } from '../utils/format'
import { getApiPayload, getPaymentHistoryErrorMessage } from '../utils/paymentHistory'

function getCancelAmount(payInfo: PaymentDetail | null) {
  const transaction = payInfo?.transactions?.[0]
  return transaction?.realSettlementAmount || transaction?.settlementAmount || 0
}

export const CancelRequestActivity: ActivityComponentType<'cancelRequest'> = () => {
  const navigation = useAppNavigation()
  const { id } = useActivityParams<'cancelRequest'>()
  const showAlert = useAlertStore((state) => state.showAlert)
  const user = useUserStore((state) => state.user)
  const authes = useUserStore((state) => state.authes)
  const [payInfo, setPayInfo] = useState<PaymentDetail | null>(null)
  const [deposit, setDeposit] = useState<CancelRequestDeposit | null>(null)
  const [depositName, setDepositName] = useState('')
  const [loading, setLoading] = useState(true)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const cancelAmount = getCancelAmount(payInfo)
  const hasPayCancel = user?.authority === 'MANAGE' || Boolean(authes?.isPayCancel)

  const loadData = useCallback(async () => {
    if (!id) return

    setLoading(true)

    try {
      const [payResponse, depositResponse] = await Promise.all([
        payments.getPayDetail(id),
        standard.getPayReqCancelDeposit(),
      ])
      setPayInfo(getApiPayload<PaymentDetail>(payResponse).data ?? null)
      setDeposit(getApiPayload<CancelRequestDeposit>(depositResponse).data ?? null)
    } catch (error) {
      showAlert({
        title: '결제 취소 요청',
        contents: getPaymentHistoryErrorMessage(error),
      })
    } finally {
      setLoading(false)
    }
  }, [id, showAlert])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const openConfirm = () => {
    if (!hasPayCancel) {
      showAlert({
        title: '권한 없음',
        contents: '결제 취소 권한이 없습니다.',
        onConfirm: navigation.goBack,
      })
      return
    }

    if (!depositName.trim()) {
      showAlert({
        title: '입금자명 입력',
        contents: '입금자명을 입력해주세요.',
      })
      return
    }

    setConfirmOpen(true)
  }

  const submitCancelRequest = async () => {
    if (!id || !payInfo || !depositName.trim() || submitting) return

    setSubmitting(true)

    try {
      await payments.cancelPay(id, {
        accountHolder: deposit?.accountHolder,
        accountNumber: deposit?.accountNumber,
        bank: deposit?.bank?.code ? { code: deposit.bank.code } : undefined,
        cancelReqStatus: 'REQUEST',
        depositAmount: cancelAmount,
        depositName: depositName.trim(),
      })
      setConfirmOpen(false)
      showAlert({
        title: '결제 취소 요청',
        contents: '해당 결제가 결제 취소 요청 되었습니다.',
        onConfirm: () => {
          window.dispatchEvent(
            new CustomEvent('payking:invoice-refresh', { detail: { id } }),
          )
          window.dispatchEvent(new CustomEvent('payking:payment-history-refresh'))
          navigation.goBack()
        },
      })
    } catch (error) {
      setConfirmOpen(false)
      showAlert({
        title: '실패',
        contents: getPaymentHistoryErrorMessage(error),
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AppContainer
      className={classes.screen}
      contentClassName={classes.content}
      bottomChildren={
        <div className={classes.bottomActions}>
          <PKButton
            buttonType="standard"
            colorType="disable"
            onClick={navigation.goBack}
            title="취소"
          />
          <PKButton
            buttonType="standard"
            colorType="warning"
            disabled={loading}
            loading={submitting}
            onClick={openConfirm}
            title="결제 취소 요청"
          />
        </div>
      }
      topChildren={<AppHeader onBack={navigation.goBack} title="결제 취소 요청" />}
    >
      {loading ? (
        <div className={classes.loading}>
          <LoaderCircle className={classes.spinner} size={24} />
          <PKText as="p" className={classes.loadingText} weight={200}>
            불러오는 중입니다.
          </PKText>
        </div>
      ) : (
        <div className={classes.body}>
          <section className={classes.amountCard}>
            <PKText as="p" className={classes.amountLabel} weight={200}>
              취소금액
            </PKText>
            <PKText as="p" className={classes.amountValue} weight={600}>
              {addCommasToNumber(cancelAmount)}원
            </PKText>
          </section>

          <section className={classes.notice}>
            <PKText as="p" className={classes.noticeText} weight={200}>
              합계 : {addCommasToNumber(cancelAmount)}원을 아래 계좌로 입금 시,
              취소가 가능합니다.
            </PKText>
            <PKText as="p" className={classes.noticeText} weight={200}>
              입금계좌 : {deposit?.accountNumber || '-'}
            </PKText>
            <PKText as="p" className={classes.noticeText} weight={200}>
              입금은행 : {deposit?.bank?.name || '-'} / 예금주 :{' '}
              {deposit?.accountHolder || '-'}
            </PKText>
            <PKText as="p" className={classes.noticeText} weight={200}>
              취소 요청 후 30일 이상 입금 진행이 안되는 경우, 요청이 취소될 수
              있습니다.
            </PKText>
          </section>

          <section className={classes.infoSection}>
            <dl className={classes.definitionList}>
              <DetailRow
                label="구매자 휴대폰번호"
                value={
                  payInfo?.buyerPhoneNumber
                    ? formatTelephone(payInfo.buyerPhoneNumber)
                    : '-'
                }
              />
              <DetailRow label="결제상품" value={payInfo?.goodsName} />
              <DetailRow
                label="결제금액"
                value={`${addCommasToNumber(payInfo?.totalPayAmount)}원`}
              />
            </dl>
            <div className={classes.inputBlock}>
              <PKText as="label" className={classes.inputLabel} weight={200}>
                입금자명 <span className={classes.required}>*</span>
              </PKText>
              <PKInput
                onChangeText={setDepositName}
                placeholder="상호(대표자명)을 입력하세요."
                value={depositName}
              />
              <PKText as="p" className={classes.inputHelp} weight={200}>
                입금자명이 다른 경우, 취소 처리가 지연될 수 있습니다.
              </PKText>
            </div>
          </section>
        </div>
      )}
      <PKConfirm
        confirmColorType="warning"
        confirmTitle="확인"
        contents="해당 결제 취소 요청 하시겠습니까?"
        onConfirm={submitCancelRequest}
        onOpenChange={(open) => {
          if (!open && !submitting) setConfirmOpen(false)
        }}
        onReject={() => setConfirmOpen(false)}
        rejectTitle="취소"
        title="결제 취소 요청"
        visible={confirmOpen}
      />
    </AppContainer>
  )
}

function DetailRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className={classes.row}>
      <PKText as="dt" className={classes.rowLabel} weight={500}>
        {label}
      </PKText>
      <PKText as="dd" className={classes.rowValue} weight={200}>
        {value || '-'}
      </PKText>
    </div>
  )
}

const classes = {
  screen: 'bg-white text-[var(--pk-text)]',
  content: 'px-0 pb-6 pt-[15px]',
  loading: 'flex min-h-[240px] flex-col items-center justify-center gap-2',
  spinner: 'animate-spin text-[#8b9099]',
  loadingText: 'm-0 text-[14px] leading-[1.4] text-[#8b9099]',
  body: 'grid gap-6 pb-6',
  amountCard:
    'mx-5 grid min-h-[86px] place-items-center gap-2 rounded-[20px] bg-[#f1f2f5] p-4 text-center',
  amountLabel: 'm-0 text-[14px] leading-[1.25] text-[#191919]',
  amountValue: 'm-0 text-[24px] leading-[1.2] text-[#191919]',
  notice: 'mx-5 grid gap-4 text-center',
  noticeText: 'm-0 text-[14px] leading-[1.45] text-[#191919]',
  infoSection:
    'mx-5 grid border-0 border-t border-solid border-t-[#1e1e1e] px-1',
  definitionList: 'm-0 grid',
  row:
    'grid min-h-[50px] grid-cols-[minmax(112px,auto)_1fr] items-center gap-2 border-0 border-b border-solid border-b-[#e7e9ee] py-2',
  rowLabel: 'm-0 text-[14px] leading-[1.35] text-[#191919]',
  rowValue:
    'm-0 min-w-0 text-right text-[14px] leading-[1.45] text-[#191919] [overflow-wrap:anywhere]',
  inputBlock: 'grid gap-2 py-6',
  inputLabel: 'm-0 text-[14px] leading-[1.35] text-[#191919]',
  required: 'text-[var(--pk-primary)]',
  inputHelp: 'm-0 text-[12px] leading-[1.35] text-[var(--pk-danger)]',
  bottomActions: 'flex gap-2 [&>button]:min-w-0 [&>button]:flex-1',
}
