export type LinkPaymentTaxType = 'TAX' | 'FREE'

export type LinkPaymentTaxDeductType = 'NORMAL' | 'CULTURAL'

export type LinkPaymentEntryMode = 'MAIN' | 'INPUT' | 'GOODS'

export type LinkPaymentGoodsType = 'DIRECT' | 'GOODS'

export type LinkPaymentGoods = {
  id?: string | number
  code?: string | number
  ord?: number
  count: number
  goodsType?: LinkPaymentGoodsType
  name: string
  price: number | string
  taxType: LinkPaymentTaxType
  [key: string]: unknown
}

export type LinkPaymentRequest = {
  agentId?: string | number
  goodses: LinkPaymentGoods[]
  name: string
  payFunnel: 'CONTACT_QR' | 'DIRECT_LINK'
  phoneNumber?: string
  price: number
  taxDeductType: LinkPaymentTaxDeductType
  quotaMonths: number
}

export type LinkPaymentResponse = {
  id?: string | number
  name?: string
  payLinkUrl?: string
  price?: number
  discount?: number
  [key: string]: unknown
}
