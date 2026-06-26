import { useEffect } from 'react'
import { useFlow } from '@stackflow/react'
import { getActivityMeta } from './activityRegistry'
import { useSessionStore } from '../stores/sessionStore'
import { usePermissionStore } from '../stores/permissionStore'

type AuthRouteGuardProps = {
  topActivityName?: string
}

export function AuthRouteGuard({ topActivityName }: AuthRouteGuardProps) {
  const flow = useFlow()
  const accessToken = useSessionStore((state) => state.accessToken)
  const hydrated = useSessionStore((state) => state.hydrated)
  const permissionsChecked = usePermissionStore((state) => state.checked)
  const requiredPermissionsGranted = usePermissionStore(
    (state) => state.snapshot?.requiredGranted ?? false,
  )

  useEffect(() => {
    if (
      !hydrated ||
      !permissionsChecked ||
      !requiredPermissionsGranted ||
      !topActivityName ||
      topActivityName === 'permission'
    ) {
      return
    }

    const meta = getActivityMeta(topActivityName)
    if (!meta) return

    if (meta.auth && !accessToken) {
      flow.replace('login', {}, { animate: false })
      return
    }

    if ('guestOnly' in meta && meta.guestOnly && accessToken) {
      flow.replace('mainTab', {}, { animate: false })
    }
  }, [
    accessToken,
    flow,
    hydrated,
    permissionsChecked,
    requiredPermissionsGranted,
    topActivityName,
  ])

  return null
}
