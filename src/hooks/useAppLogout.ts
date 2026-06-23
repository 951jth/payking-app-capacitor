import { useCallback } from 'react'
import { useAppNavigation } from '../navigation/useAppNavigation'
import { useSessionStore } from '../stores/sessionStore'
import { useUserStore } from '../stores/userStore'

export function useAppLogout() {
  const navigation = useAppNavigation()
  const logoutSession = useSessionStore((state) => state.logout)
  const resetUser = useUserStore((state) => state.reset)

  return useCallback(() => {
    logoutSession()
    resetUser()
    navigation.replace('login', {})
  }, [logoutSession, navigation, resetUser])
}
