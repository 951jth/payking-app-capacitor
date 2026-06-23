export type PaymentTransaction = {
  id?: string | number
  quotaMonths?: number
  taxDeductType?: string
  transactionStatus?: string
  payAmount?: number
  partCultPercent?: number
  realSettlementAmount?: number
  settlementAmount?: number
}

export type CancelRequestDeposit = {
  depositAmount?: number
  depositName?: string
  accountHolder?: string
  accountNumber?: string
  bank?: {
    code?: string
    name?: string
  }
}

export type PaymentDetail = {
  id?: string | number
  goodsName?: string
  status?: string
  cancelRequestStatus?: string
  requestDate?: string
  payDate?: string
  cancelRequestDate?: string
  cancelDate?: string
  buyerName?: string
  buyerPhoneNumber?: string
  buyerAddress?: string
  buyerAddressDetail?: string
  totalPayAmount?: number
  payMethod?: string
  payType?: string
  isCancelReq?: boolean
  cancelRequestDeposit?: CancelRequestDeposit
  transactions?: PaymentTransaction[]
}

export type CancelPayResult = {
  resultCode?: string
  failReason?: string
}
