import { useFlow } from '@stackflow/react'
import type { ActivityName, ActivityParams } from './activityParams'

export type { ActivityName, ActivityParams } from './activityParams'

export function useAppNavigation() {
  const flow = useFlow()

  return {
    navigate<Name extends ActivityName>(name: Name, params: ActivityParams[Name]) {
      return flow.push(name, params)
    },
    replace<Name extends ActivityName>(name: Name, params: ActivityParams[Name]) {
      return flow.replace(name, params)
    },
    goBack() {
      flow.pop()
    },
  }
}
