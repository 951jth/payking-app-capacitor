export type ActivityParams = {
  login: Record<string, never>
  findId: Record<string, never>
  findPw: Record<string, never>
  homeMain: Record<string, never>
  paymentHistory: Record<string, never>
  invoice: {
    id: string | number
    from?: 'settlementHistory'
  }
  cancelRequest: {
    id: string | number
  }
  settlementHistory: Record<string, never>
  linkPayment: Record<string, never>
  setting: Record<string, never>
  userHome: Record<string, never>
  sampleHome: Record<string, never>
  sampleDetail: {
    source: string
  }
}

export type ActivityName = keyof ActivityParams
