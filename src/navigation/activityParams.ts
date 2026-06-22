export type ActivityParams = {
  login: Record<string, never>
  homeMain: Record<string, never>
  paymentHistory: Record<string, never>
  settlementHistory: Record<string, never>
  linkPayment: Record<string, never>
  userHome: Record<string, never>
  sampleHome: Record<string, never>
  sampleDetail: {
    source: string
  }
}

export type ActivityName = keyof ActivityParams
