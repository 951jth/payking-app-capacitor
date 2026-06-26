import { useFlow } from '@stackflow/react'
import { useEffect } from 'react'
import { usePermissionStore } from '../stores/permissionStore'
import { useSessionStore } from '../stores/sessionStore'

type PermissionRouteGuardProps = {
  topActivityName?: string
}

export function PermissionRouteGuard({
  topActivityName,
}: PermissionRouteGuardProps) {
  const flow = useFlow()
  const accessToken = useSessionStore((state) => state.accessToken)
  const sessionHydrated = useSessionStore((state) => state.hydrated)
  const checked = usePermissionStore((state) => state.checked)
  const checking = usePermissionStore((state) => state.checking)
  const requiredGranted = usePermissionStore(
    (state) => state.snapshot?.requiredGranted ?? false,
  )
  const checkPermissions = usePermissionStore(
    (state) => state.checkPermissions,
  )

  useEffect(() => {
    if (checked || checking) return

    void checkPermissions().catch((error) => {
      console.warn('앱 권한 확인 실패:', error)
    })
  }, [checkPermissions, checked, checking])

  useEffect(() => {
    if (!checked || !sessionHydrated || !topActivityName) return

    if (!requiredGranted && topActivityName !== 'permission') {
      flow.replace('permission', {}, { animate: false })
      return
    }

    if (requiredGranted && topActivityName === 'permission') {
      flow.replace(accessToken ? 'mainTab' : 'login', {}, { animate: false })
    }
  }, [
    accessToken,
    checked,
    flow,
    requiredGranted,
    sessionHydrated,
    topActivityName,
  ])

  const routing =
    !checked ||
    !sessionHydrated ||
    (!requiredGranted && topActivityName !== 'permission') ||
    (requiredGranted && topActivityName === 'permission')

  if (!routing) return null

  return <div className="absolute inset-0 z-[1000] bg-white" />
}
