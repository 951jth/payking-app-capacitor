import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import {
  getDeviceRegistrationInfo,
  type DeviceRegistrationInfo,
} from '../adapters/deviceAdapter'
import { preferencesStorage } from '../storage/preferencesStorage'
import authService from '../service/auth'
import { getResponseToken } from '../service/axios'
import { useSessionStore } from './sessionStore'

type DeviceState = {
  appVersion: string | null
  fcmPushToken: string | null
  model: string | null
  osType: 'IOS' | 'ANDROID' | 'WEB' | null
  osVersion: string | null
  uuid: string | null
  deviceReady: boolean
  hydrated: boolean
  registerDevice: () => Promise<void>
  getDeviceToken: () => Promise<void>
  setFcmPushToken: (token: string | null) => void
  setHydrated: (hydrated: boolean) => void
  resetDeviceStore: () => void
}

const initialDeviceState = {
  appVersion: null,
  fcmPushToken: null,
  model: null,
  osType: null,
  osVersion: null,
  uuid: null,
  deviceReady: false,
  hydrated: false,
}

function resolveRegisteredDeviceInfo(
  deviceInfo: DeviceRegistrationInfo,
  responseData: unknown,
): DeviceRegistrationInfo {
  if (!responseData || typeof responseData !== 'object') return deviceInfo

  const payload = responseData as {
    data?: Partial<DeviceRegistrationInfo>
  }

  return {
    ...deviceInfo,
    ...payload.data,
  }
}

export const useDeviceStore = create<DeviceState>()(
  persist(
    (set, get) => ({
      ...initialDeviceState,
      async registerDevice() {
        const current = get()

        if (current.uuid && current.osType && useSessionStore.getState().deviceToken) {
          set({ deviceReady: true })
          return
        }

        const deviceInfo = await getDeviceRegistrationInfo(current.uuid)
        let registeredDeviceInfo = deviceInfo

        try {
          const response = await authService.registerDevices(deviceInfo)

          if (response.status !== 208) {
            registeredDeviceInfo = resolveRegisteredDeviceInfo(
              deviceInfo,
              response.data,
            )
          }
        } catch (error) {
          console.warn('디바이스 등록 실패:', error)
        }

        set({
          appVersion: registeredDeviceInfo.appVersion,
          fcmPushToken: registeredDeviceInfo.fcmPushToken,
          model: registeredDeviceInfo.model,
          osType: registeredDeviceInfo.osType,
          osVersion: registeredDeviceInfo.osVersion,
          uuid: registeredDeviceInfo.uuid,
          deviceReady: true,
        })

        if (!useSessionStore.getState().deviceToken) {
          await get().getDeviceToken()
        }
      },
      async getDeviceToken() {
        const { uuid, osType } = get()
        if (!uuid || !osType) return

        const response = await authService.getDeviceToken({
          'device-uuid': uuid,
          'device-type': osType,
        })
        const token = getResponseToken(response.data)

        if (token) {
          useSessionStore.getState().setDeviceToken(token)
        }
      },
      setFcmPushToken(fcmPushToken) {
        set({ fcmPushToken })
      },
      setHydrated(hydrated) {
        set({ hydrated })
      },
      resetDeviceStore() {
        set(initialDeviceState)
        useSessionStore.getState().setDeviceToken(null)
      },
    }),
    {
      name: 'payking-device',
      storage: createJSONStorage(() => preferencesStorage),
      partialize: (state) => ({
        appVersion: state.appVersion,
        fcmPushToken: state.fcmPushToken,
        model: state.model,
        osType: state.osType,
        osVersion: state.osVersion,
        uuid: state.uuid,
        deviceReady: state.deviceReady,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true)
      },
    },
  ),
)
