export type SettlementStatus = 'EXPECTED' | 'COMPLETED' | 'UNSETTLED'

export type SettlementListItem = {
  id?: string | number
  settlementDate?: string
  goodsName?: string
  buyerPhoneNumber?: string
  quotaMonths?: number
  payType?: string
  settlementAmount?: number
  settlementCancelAmount?: number
  settlementRemainAmount?: number
  settlementStatus?: SettlementStatus | string
}

export type SettlementStatusAmountStat = {
  status?: SettlementStatus | string
  totalAmount?: number
}
