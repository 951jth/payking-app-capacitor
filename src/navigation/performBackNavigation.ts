import { App } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'
import { alertStore } from '../stores/alertStore'
import { overlayStore } from '../stores/overlayStore'

export type BackNavigationResult = 'alert' | 'overlay' | 'pop' | 'exit' | 'noop'

type PerformBackNavigationParams = {
  isRoot: boolean
  pop: () => void
}

export function canPerformBackNavigation(isRoot: boolean) {
  if (alertStore.getState().visible) return true
  if (overlayStore.getState().hasOverlay()) return true
  return !isRoot || Capacitor.isNativePlatform()
}

export function performBackNavigation({
  isRoot,
  pop,
}: PerformBackNavigationParams): BackNavigationResult {
  if (alertStore.getState().visible) {
    alertStore.getState().hideAlert()
    return 'alert'
  }

  if (overlayStore.getState().closeTop()) {
    return 'overlay'
  }

  if (!isRoot) {
    pop()
    return 'pop'
  }

  if (Capacitor.isNativePlatform()) {
    void App.exitApp()
    return 'exit'
  }

  return 'noop'
}
