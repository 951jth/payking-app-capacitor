import type { PropsWithChildren } from 'react'
import { GlobalPKAlertRenderer } from '../components/modal/GlobalPKAlertRenderer'
import { useAppRuntime } from './useAppRuntime'

export function AppProviders({ children }: PropsWithChildren) {
  useAppRuntime()

  return (
    <div className="app-root">
      {children}
      <GlobalPKAlertRenderer />
    </div>
  )
}
