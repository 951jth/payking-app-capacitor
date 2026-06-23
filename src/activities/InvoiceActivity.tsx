import type { ActivityComponentType } from '@stackflow/react'
import { useActivityParams } from '@stackflow/react'
import dayjs from 'dayjs'
import { LoaderCircle } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import {
  AppContainer,
  AppHeader,
  BottomModal,
  PKButton,
  PKConfirm,
  PKInput,
  PKPayStatusesChip,
  PKText,
} from '../components'
import { useAppNavigation } from '../navigation/useAppNavigation'
import payments from '../service/payments'
import { useAlertStore } from '../stores/alertStore'
import { useUserStore } from '../stores/userStore'
import type { CancelPayResult, PaymentDetail } from '../types/payment'
import { addCommasToNumber, formatTelephone } from '../utils/format'
import { getApiPayload, getPaymentHistoryErrorMessage } from '../utils/paymentHistory'

type CancelNextStatus = 'REQUEST_CAN' | 'IMMEDIATELY_CANCEL' | 'CANCEL' | 'REQUEST'

type CancelAction = {
  title: string
  nextStatus: CancelNextStatus
}

const payTypeToText: Record<string, string> = {
  DIRECT_LINK: '(카톡)링크결제/QR결제',
  SAVE_LINK: '저장링크 결제',
  RECURRING: '정기결제',
  DIRECT_PAY: '카드직접결제',
  CASH_PAY: '현금결제',
}

function formatDate(value?: string) {
  if (!value) return '-'

  const date = dayjs(value)
  if (!date.isValid()) return '-'

  return date.format('YYYY.MM.DD HH:mm')
}

function getPaymentDateLabel(invoice: PaymentDetail | null) {
  if (
    invoice?.status === 'REQUEST' ||
    invoice?.status === 'REQUEST_EXP' ||
    invoice?.status === 'REQUEST_CAN'
  ) {
    return '결제요청일'
  }

  return '결제일'
}

function getPaymentDate(invoice: PaymentDetail | null) {
  if (
    invoice?.status === 'REQUEST' ||
    invoice?.status === 'REQUEST_EXP' ||
    invoice?.status === 'REQUEST_CAN'
  ) {
    return formatDate(invoice?.requestDate)
  }

  return formatDate(invoice?.payDate)
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

function getCancelAction(invoice: PaymentDetail | null): CancelAction | null {
  const { cancelRequestStatus, status, payMethod, isCancelReq } = invoice ?? {}

  if (!invoice || status === 'REQUEST_EXP' || status === 'REQUEST_CAN') return null
  if (cancelRequestStatus === 'COMPLETE') return null

  if (status === 'REQUEST') {
    return { title: '결제 요청 취소', nextStatus: 'REQUEST_CAN' }
  }

  if (cancelRequestStatus === 'REQUEST') {
    return { title: '결제 취소 요청 취소', nextStatus: 'CANCEL' }
  }

  if (cancelRequestStatus === 'CANCEL') {
    return { title: '결제 취소 요청', nextStatus: 'REQUEST' }
  }

  if (status === 'SUCCESS' && payMethod === 'CASH') {
    return { title: '결제 취소', nextStatus: 'IMMEDIATELY_CANCEL' }
  }

  if (status === 'SUCCESS' && isCancelReq) {
    return { title: '결제 취소 요청', nextStatus: 'REQUEST' }
  }

  if (status === 'SUCCESS') {
    return { title: '결제 취소', nextStatus: 'IMMEDIATELY_CANCEL' }
  }

  return null
}

function getCancelDialogTitle(nextStatus?: CancelNextStatus) {
  if (nextStatus === 'REQUEST_CAN') return '결제 요청 취소'
  if (nextStatus === 'IMMEDIATELY_CANCEL') return '결제 취소'
  if (nextStatus === 'CANCEL') return '결제 취소 요청 취소'
  return ''
}

function getCancelSuccessMessage(nextStatus?: CancelNextStatus) {
  if (nextStatus === 'REQUEST_CAN') return "결제 요청 '취소' 되었습니다."
  if (nextStatus === 'IMMEDIATELY_CANCEL') return "해당 결제가 '취소' 되었습니다."
  if (nextStatus === 'CANCEL') return '해당 결제가 취소 요청 취소 되었습니다.'
  return ''
}

function shouldShowCancelDeposit(invoice: PaymentDetail | null) {
  return (
    invoice?.cancelRequestStatus === 'REQUEST' ||
    invoice?.cancelRequestStatus === 'COMPLETE'
  )
}

export const InvoiceActivity: ActivityComponentType<'invoice'> = () => {
  const navigation = useAppNavigation()
  const { id, from } = useActivityParams<'invoice'>()
  const showAlert = useAlertStore((state) => state.showAlert)
  const user = useUserStore((state) => state.user)
  const authes = useUserStore((state) => state.authes)
  const [invoice, setInvoice] = useState<PaymentDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [receiptModalOpen, setReceiptModalOpen] = useState(false)
  const [receiptPhoneNumber, setReceiptPhoneNumber] = useState('')
  const [sendingReceipt, setSendingReceipt] = useState(false)
  const [cancelAction, setCancelAction] = useState<CancelAction | null>(null)
  const [cancelLoading, setCancelLoading] = useState(false)

  const hasPayCancel = user?.authority === 'MANAGE' || Boolean(authes?.isPayCancel)
  const hideCancelActions = from === 'settlementHistory'
  const cancelButtonAction =
    hasPayCancel && !hideCancelActions ? getCancelAction(invoice) : null
  const canSendReceipt =
    invoice?.payMethod === 'CARD' &&
    Boolean(
      invoice.cancelRequestStatus ||
        invoice.status === 'SUCCESS' ||
        invoice.status === 'CANCEL',
    )

  const loadInvoice = useCallback(async () => {
    if (!id) return

    setLoading(true)

    try {
      const response = await payments.getPayDetail(id)
      const payload = getApiPayload<PaymentDetail>(response)
      setInvoice(payload.data ?? null)
    } catch (error) {
      showAlert({
        title: '결제 명세서',
        contents: getPaymentHistoryErrorMessage(error),
      })
    } finally {
      setLoading(false)
    }
  }, [id, showAlert])

  useEffect(() => {
    void loadInvoice()
  }, [loadInvoice])

  useEffect(() => {
    const handleRefresh = (event: Event) => {
      const refreshId = (event as CustomEvent<{ id?: string | number }>).detail?.id
      if (String(refreshId) === String(id)) {
        void loadInvoice()
      }
    }

    window.addEventListener('payking:invoice-refresh', handleRefresh)

    return () => {
      window.removeEventListener('payking:invoice-refresh', handleRefresh)
    }
  }, [id, loadInvoice])

  const openReceiptModal = () => {
    setReceiptPhoneNumber(invoice?.buyerPhoneNumber ?? '')
    setReceiptModalOpen(true)
  }

  const closeReceiptModal = () => {
    if (sendingReceipt) return
    setReceiptModalOpen(false)
  }

  const handleSendReceipt = async () => {
    if (!id || receiptPhoneNumber.length < 10 || sendingReceipt) return

    setSendingReceipt(true)

    try {
      await payments.sendPayReceipt(id, receiptPhoneNumber)
      setReceiptModalOpen(false)
      setReceiptPhoneNumber('')
      showAlert({
        title: '영수증 보내기',
        contents: '입력하신 전화번호로 전송이 완료되었습니다.',
      })
    } catch (error) {
      showAlert({
        title: '영수증 보내기',
        contents: getPaymentHistoryErrorMessage(error),
      })
    } finally {
      setSendingReceipt(false)
    }
  }

  const openCancelAction = () => {
    if (!cancelButtonAction || !id) return

    if (cancelButtonAction.nextStatus === 'REQUEST') {
      navigation.navigate('cancelRequest', { id })
      return
    }

    setCancelAction(cancelButtonAction)
  }

  const closeCancelConfirm = () => {
    if (cancelLoading) return
    setCancelAction(null)
  }

  const handleCancelPay = async () => {
    if (!id || !invoice || !cancelAction || cancelLoading) return

    setCancelLoading(true)

    try {
      const response =
        cancelAction.nextStatus === 'REQUEST_CAN'
          ? await payments.requestCancelPay(id)
          : invoice.payMethod === 'CASH'
            ? await payments.cancelPayCash(id)
            : await payments.cancelPay(
                id,
                cancelAction.nextStatus === 'IMMEDIATELY_CANCEL'
                  ? undefined
                  : { cancelReqStatus: cancelAction.nextStatus },
              )
      const payload = getApiPayload<CancelPayResult>(response)
      const result = payload.data

      if (result?.resultCode && result.resultCode !== 'SUCCESS') {
        throw new Error(result.failReason || '서버 오류')
      }

      setCancelAction(null)
      showAlert({
        title: getCancelDialogTitle(cancelAction.nextStatus),
        contents: getCancelSuccessMessage(cancelAction.nextStatus),
      })
      await loadInvoice()
      window.dispatchEvent(new CustomEvent('payking:payment-history-refresh'))
    } catch (error) {
      setCancelAction(null)
      showAlert({
        title: `${getCancelDialogTitle(cancelAction.nextStatus) || '처리'} 실패`,
        contents:
          error instanceof Error
            ? error.message
            : getPaymentHistoryErrorMessage(error),
      })
    } finally {
      setCancelLoading(false)
    }
  }

  return (
    <AppContainer
      className={classes.screen}
      contentClassName={classes.content}
      bottomChildren={
        cancelButtonAction || canSendReceipt ? (
          <div className={classes.bottomActions}>
            {cancelButtonAction && (
              <PKButton
                buttonType="standard"
                colorType="warning"
                onClick={openCancelAction}
                title={cancelButtonAction.title}
              />
            )}
            {canSendReceipt && (
              <PKButton
                buttonType="standard"
                onClick={openReceiptModal}
                title="영수증 보내기"
              />
            )}
          </div>
        ) : null
      }
      topChildren={<AppHeader onBack={navigation.goBack} title="결제 명세서" />}
    >
      {loading ? (
        <div className={classes.loading}>
          <LoaderCircle className={classes.spinner} size={24} />
          <PKText as="p" className={classes.loadingText} weight={200}>
            불러오는 중입니다.
          </PKText>
        </div>
      ) : (
        <div className={classes.sections}>
          <section className={classes.section}>
            <div className={classes.sectionTitleWrap}>
              <PKText as="h2" className={classes.sectionTitle} weight={200}>
                결제 정보
              </PKText>
            </div>
            <dl className={classes.definitionList}>
              <DetailRow label="항목" value={invoice?.goodsName} />
              <DetailRow label={getPaymentDateLabel(invoice)} value={getPaymentDate(invoice)} />
              {invoice?.cancelRequestDate && (
                <DetailRow
                  label="결제 취소 요청일"
                  value={formatDate(invoice.cancelRequestDate)}
                />
              )}
              {invoice?.cancelDate && (
                <DetailRow label="결제 취소일" value={formatDate(invoice.cancelDate)} />
              )}
              {invoice?.payType === 'SAVE_LINK' && (
                <DetailRow label="구매자명" value={invoice.buyerName} />
              )}
              <DetailRow
                label="구매자 휴대폰번호"
                value={
                  invoice?.buyerPhoneNumber
                    ? formatTelephone(invoice.buyerPhoneNumber)
                    : '-'
                }
              />
              {invoice?.payType === 'SAVE_LINK' && (
                <DetailRow
                  label="구매자 주소"
                  value={[invoice.buyerAddress, invoice.buyerAddressDetail]
                    .filter(Boolean)
                    .join(' ')}
                />
              )}
              <DetailRow
                label="결제 금액"
                value={`${addCommasToNumber(invoice?.totalPayAmount)}원`}
              />
              <DetailRow
                label="문화비소득공제"
                value={
                  invoice?.transactions?.[0]?.taxDeductType === 'NORMAL'
                    ? '적용 안함'
                    : '적용'
                }
              />
              <DetailRow
                label="할부 구분"
                value={
                  (invoice?.transactions?.[0]?.quotaMonths ?? 0) > 0
                    ? `${invoice?.transactions?.[0]?.quotaMonths}개월 할부`
                    : '일시불'
                }
              />
              <DetailRow
                label="결제 구분"
                value={invoice?.payType ? payTypeToText[invoice.payType] : '-'}
              />
            </dl>
            <div className={classes.statusRow}>
              <PKText as="p" className={classes.statusLabel} weight={500}>
                결제 상태
              </PKText>
              <PKPayStatusesChip
                cancelRequestStatus={invoice?.cancelRequestStatus}
                payStatuses={invoice?.status}
              />
            </div>
            {shouldShowCancelDeposit(invoice) && (
              <dl className={classes.definitionList}>
                <DetailRow
                  label="입금금액"
                  value={
                    invoice?.cancelRequestDeposit?.depositAmount
                      ? `${addCommasToNumber(
                          invoice.cancelRequestDeposit.depositAmount,
                        )}원`
                      : '-'
                  }
                />
                <DetailRow
                  label="입금자명"
                  value={invoice?.cancelRequestDeposit?.depositName}
                />
                <DetailRow
                  label="입금은행"
                  value={invoice?.cancelRequestDeposit?.bank?.name}
                />
                <DetailRow
                  label="입금계좌"
                  value={invoice?.cancelRequestDeposit?.accountNumber}
                />
                <DetailRow
                  label="예금주"
                  value={invoice?.cancelRequestDeposit?.accountHolder}
                />
              </dl>
            )}
          </section>

          {(invoice?.transactions?.length ?? 0) > 1 &&
            invoice?.transactions?.map((transaction) => (
              <section className={classes.section} key={transaction.id}>
                <div className={classes.sectionTitleWrap}>
                  <PKText as="h2" className={classes.sectionTitle} weight={200}>
                    {transaction.taxDeductType === 'NORMAL'
                      ? '일반결제'
                      : '문화비소득공제'}
                  </PKText>
                </div>
                <dl className={classes.definitionList}>
                  <DetailRow
                    label="결제 금액"
                    value={`${addCommasToNumber(transaction.payAmount)}원`}
                  />
                  {transaction.taxDeductType !== 'NORMAL' && (
                    <DetailRow
                      label="문화비소득공제"
                      value={
                        (transaction.partCultPercent ?? 0) > 0
                          ? `${transaction.partCultPercent}%적용`
                          : '전체적용'
                      }
                    />
                  )}
                </dl>
                <div className={classes.statusRow}>
                  <PKText as="p" className={classes.statusLabel} weight={500}>
                    상태
                  </PKText>
                  <PKPayStatusesChip
                    cancelRequestStatus={invoice.cancelRequestStatus}
                    payStatuses={transaction.transactionStatus}
                  />
                </div>
              </section>
            ))}
        </div>
      )}
      <BottomModal
        title="영수증 보내기"
        visible={receiptModalOpen}
        onClose={closeReceiptModal}
        useScrollView={false}
      >
        <div className={classes.receiptSheet}>
          <PKInput
            inputMode="tel"
            onChangeText={setReceiptPhoneNumber}
            placeholder="휴대폰번호"
            type="phoneNumber"
            value={receiptPhoneNumber}
          />
          <PKButton
            buttonType="standard"
            colorType="primary"
            disabled={receiptPhoneNumber.length < 10}
            loading={sendingReceipt}
            onClick={handleSendReceipt}
            title="전송"
          />
        </div>
      </BottomModal>
      <PKConfirm
        confirmTitle="확인"
        contents={
          cancelAction?.nextStatus === 'IMMEDIATELY_CANCEL' ? (
            <div className={classes.cancelConfirmContents}>
              <PKText as="p" className={classes.cancelConfirmText}>
                해당 결제를 '취소' 하시겠습니까?
              </PKText>
              <PKText as="p" className={classes.cancelConfirmWarning}>
                취소금액은 다음 정산에서 차감될 수 있어요.
              </PKText>
            </div>
          ) : cancelAction?.nextStatus === 'REQUEST_CAN' ? (
            "결제 요청을 '취소' 하시겠습니까?"
          ) : cancelAction?.nextStatus === 'CANCEL' ? (
            "해당 결제 취소 요청을 '취소' 하시겠습니까?"
          ) : (
            ''
          )
        }
        confirmColorType="warning"
        onConfirm={handleCancelPay}
        onOpenChange={(open) => {
          if (!open) closeCancelConfirm()
        }}
        onReject={closeCancelConfirm}
        rejectTitle="취소"
        title={getCancelDialogTitle(cancelAction?.nextStatus)}
        visible={Boolean(cancelAction)}
      />
    </AppContainer>
  )
}

const classes = {
  screen: 'bg-white text-[var(--pk-text)]',
  content: 'px-0 pb-6 pt-[15px]',
  loading: 'flex min-h-[240px] flex-col items-center justify-center gap-2',
  spinner: 'animate-spin text-[#8b9099]',
  loadingText: 'm-0 text-[14px] leading-[1.4] text-[#8b9099]',
  sections: 'grid gap-10 pb-6',
  section: 'grid gap-0 bg-white',
  sectionTitleWrap:
    'mx-5 border-0 border-b border-solid border-b-[#1e1e1e] px-1 py-2',
  sectionTitle: 'm-0 text-[14px] leading-[1.2] text-[#191919]',
  definitionList: 'm-0 grid',
  row:
    'mx-5 grid min-h-[50px] grid-cols-[minmax(104px,auto)_minmax(0,1fr)] items-center gap-2 border-0 border-b border-solid border-b-[#e7e9ee] px-1 py-2',
  rowLabel: 'm-0 text-[14px] leading-[1.35] text-[#191919]',
  rowValue:
    'm-0 min-w-0 text-right text-[14px] leading-[1.45] text-[#191919] [overflow-wrap:anywhere]',
  statusRow:
    'mx-5 flex min-h-[50px] items-center justify-between gap-2 border-0 border-b border-solid border-b-[#e7e9ee] px-1 py-2',
  statusLabel: 'm-0 text-[14px] leading-[1.35] text-[#191919]',
  bottomActions: 'flex gap-2 [&>button]:min-w-0 [&>button]:flex-1',
  receiptSheet: 'grid gap-4 px-5 pb-[calc(20px+env(safe-area-inset-bottom))] pt-2',
  cancelConfirmContents: 'mb-6 grid gap-1',
  cancelConfirmText: 'm-0 text-center text-sm font-extralight leading-normal text-[#191919]',
  cancelConfirmWarning:
    'm-0 text-center text-xs font-extralight leading-normal text-[var(--pk-danger)]',
}
