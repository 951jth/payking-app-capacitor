import { Preferences } from '@capacitor/preferences'
import type { StateStorage } from 'zustand/middleware'

export const preferencesStorage: StateStorage = {
  async getItem(name) {
    const result = await Preferences.get({ key: name })
    return result.value
  },
  async setItem(name, value) {
    await Preferences.set({ key: name, value })
  },
  async removeItem(name) {
    await Preferences.remove({ key: name })
  },
}
