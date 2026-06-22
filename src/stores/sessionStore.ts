import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { preferencesStorage } from '../storage/preferencesStorage'

type SessionState = {
  accessToken: string | null
  deviceToken: string | null
  hydrated: boolean
  setAccessToken: (token: string | null) => void
  setDeviceToken: (token: string | null) => void
  setHydrated: (hydrated: boolean) => void
  logout: () => void
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      accessToken: null,
      deviceToken: null,
      hydrated: false,
      setAccessToken: (accessToken) => set({ accessToken }),
      setDeviceToken: (deviceToken) => set({ deviceToken }),
      setHydrated: (hydrated) => set({ hydrated }),
      logout: () => set({ accessToken: null }),
    }),
    {
      name: 'payking-session',
      storage: createJSONStorage(() => preferencesStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        deviceToken: state.deviceToken,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true)
      },
    },
  ),
)
