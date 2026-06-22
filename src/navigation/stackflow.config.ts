import { defineConfig } from '@stackflow/config'
import { activityDefinitions, initialActivity } from './activityRegistry'

declare module '@stackflow/config' {
  interface Register {
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
}

export const stackflowConfig = defineConfig({
  activities: activityDefinitions.map(({ name }) => ({ name })),
  initialActivity: () => initialActivity,
  transitionDuration: 300,
})
