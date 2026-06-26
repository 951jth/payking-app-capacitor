import { create } from 'zustand'
import {
  checkAppPermissions,
  requestAllAppPermissions,
  type AppPermissionSnapshot,
} from '../adapters/permissionAdapter'

type PermissionState = {
  checked: boolean
  checking: boolean
  snapshot: AppPermissionSnapshot | null
  checkPermissions: () => Promise<AppPermissionSnapshot>
  requestPermissions: () => Promise<AppPermissionSnapshot>
}

let pendingCheck: Promise<AppPermissionSnapshot> | null = null

export const usePermissionStore = create<PermissionState>((set) => ({
  checked: false,
  checking: false,
  snapshot: null,
  async checkPermissions() {
    if (!pendingCheck) {
      set({ checking: true })
      pendingCheck = checkAppPermissions().finally(() => {
        pendingCheck = null
      })
    }

    try {
      const snapshot = await pendingCheck
      set({ checked: true, snapshot })
      return snapshot
    } finally {
      set({ checking: false })
    }
  },
  async requestPermissions() {
    set({ checking: true })

    try {
      const snapshot = await requestAllAppPermissions()
      set({ checked: true, snapshot })
      return snapshot
    } finally {
      set({ checking: false })
    }
  },
}))
