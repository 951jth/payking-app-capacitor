import { useEffect } from 'react'
import { useFlow } from '@stackflow/react'
import { getActivityMeta } from './activityRegistry'
import { useSessionStore } from '../stores/sessionStore'

type AuthRouteGuardProps = {
  topActivityName?: string
}

export function AuthRouteGuard({ topActivityName }: AuthRouteGuardProps) {
  const flow = useFlow()
  const accessToken = useSessionStore((state) => state.accessToken)
  const hydrated = useSessionStore((state) => state.hydrated)

  useEffect(() => {
    if (!hydrated || !topActivityName) return

    const meta = getActivityMeta(topActivityName)
    if (!meta) return

    if (meta.auth && !accessToken) {
      flow.replace('login', {}, { animate: false })
      return
    }

    if ('guestOnly' in meta && meta.guestOnly && accessToken) {
      flow.replace('mainTab', {}, { animate: false })
    }
  }, [accessToken, flow, hydrated, topActivityName])

  return null
}
