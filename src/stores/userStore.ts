import { create } from 'zustand'
import agentService from '../service/agent'
import type { ApiResponse } from '../service/axios'
import userService from '../service/user'

export type PaykingUser = {
  userNo?: number
  name?: string
  agentId?: number
  authority?: string
  [key: string]: unknown
}

export type GuaranteeInsurances = {
  totalPayLimit?: number
  usedAmount?: number
  status?: string
  endDate?: string
  [key: string]: unknown
}

export type AgentSettlementInfo = {
  settlementPeriod?: number
  [key: string]: unknown
}

type UserState = {
  user: PaykingUser | null
  guaranteeInsurances: GuaranteeInsurances | null
  agentSettlementInfo: AgentSettlementInfo | null
  loading: boolean
  loadHomeUserData: () => Promise<void>
  reset: () => void
}

function getApiData<T>(response: { data?: unknown }): T | null {
  const payload = response.data as ApiResponse<T> | undefined
  if (payload?.data && typeof payload.data === 'object') {
    return payload.data
  }

  return null
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  guaranteeInsurances: null,
  agentSettlementInfo: null,
  loading: false,
  loadHomeUserData: async () => {
    set({ loading: true })

    try {
      const userResponse = await userService.getMyInfo({})
      const user = getApiData<PaykingUser>(userResponse)

      set({ user })

      if (user?.agentId) {
        const [guaranteeResponse, settlementResponse] = await Promise.all([
          agentService.getAgentGuaranteeInsurances(user.agentId),
          agentService.getAgentSettlementInfo(user.agentId),
        ])

        set({
          guaranteeInsurances: getApiData<GuaranteeInsurances>(guaranteeResponse),
          agentSettlementInfo: getApiData<AgentSettlementInfo>(settlementResponse),
        })
      } else {
        set({ guaranteeInsurances: null, agentSettlementInfo: null })
      }
    } catch (error) {
      console.warn('홈 사용자 정보 조회 실패:', error)
    } finally {
      set({ loading: false })
    }
  },
  reset: () => {
    set({
      user: null,
      guaranteeInsurances: null,
      agentSettlementInfo: null,
      loading: false,
    })
  },
}))

export const userStore = useUserStore
