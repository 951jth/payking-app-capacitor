import { useEffect, useRef } from 'react'
import { App } from '@capacitor/app'
import { addNetworkStatusListener } from '../adapters/networkAdapter'
import standardService from '../service/standard'
import type { ApiResponse } from '../service/axios'
import { useDeviceStore } from '../stores/deviceStore'
import { useGlobalStore, type CSInfo, type GuideLinkInfo } from '../stores/globalStore'
import { useSessionStore } from '../stores/sessionStore'

export function useAppRuntime() {
  const deviceHydrated = useDeviceStore((state) => state.hydrated)
  const deviceReady = useDeviceStore((state) => state.deviceReady)
  const registerDevice = useDeviceStore((state) => state.registerDevice)
  const sessionHydrated = useSessionStore((state) => state.hydrated)
  const deviceToken = useSessionStore((state) => state.deviceToken)
  const didStartDeviceRegistration = useRef(false)
  const didFetchCSInfo = useRef(false)
  const didFetchGuideLinkInfo = useRef(false)

  useEffect(() => {
    const appStateListener = App.addListener('appStateChange', ({ isActive }) => {
      useGlobalStore
        .getState()
        .setAppState(isActive ? 'foreground' : 'background')
    })

    const networkListener = addNetworkStatusListener((status) => {
      if (!status.connected) {
        console.warn('네트워크 연결이 끊겼습니다.')
      }
    })

    return () => {
      void appStateListener.then((listener) => listener.remove())
      void networkListener.then((listener) => listener.remove())
    }
  }, [])

  useEffect(() => {
    if (!deviceHydrated || !sessionHydrated) return
    if (deviceReady && deviceToken) return
    if (didStartDeviceRegistration.current) return

    didStartDeviceRegistration.current = true

    void registerDevice().catch((error) => {
      console.warn('디바이스 초기화 실패:', error)
    })
  }, [
    deviceHydrated,
    deviceReady,
    deviceToken,
    registerDevice,
    sessionHydrated,
  ])

  useEffect(() => {
    if (!deviceToken || didFetchCSInfo.current) return

    didFetchCSInfo.current = true

    void standardService
      .getCSInfo()
      .then((response) => {
        const payload = response.data as ApiResponse<CSInfo>
        if (payload?.data && typeof payload.data === 'object') {
          useGlobalStore.getState().setCSInfo(payload.data)
        }
      })
      .catch((error) => {
        didFetchCSInfo.current = false
        console.warn('고객센터 정보 조회 실패:', error)
      })
  }, [deviceToken])

  useEffect(() => {
    if (!deviceToken || didFetchGuideLinkInfo.current) return

    didFetchGuideLinkInfo.current = true

    void standardService
      .getGuideLinkInfo()
      .then((response) => {
        const payload = response.data as ApiResponse<GuideLinkInfo>
        if (payload?.data && typeof payload.data === 'object') {
          useGlobalStore.getState().setGuideLinkInfo(payload.data)
        }
      })
      .catch((error) => {
        didFetchGuideLinkInfo.current = false
        console.warn('가이드 링크 정보 조회 실패:', error)
      })
  }, [deviceToken])
}
