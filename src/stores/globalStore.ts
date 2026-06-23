import { create } from 'zustand'

export type CSInfo = {
  csTelNumber?: string
  csTelDetail?: string
}

export type GuideLinkInfo = {
  isPayGuide?: boolean
  isCancelGuide?: boolean
  payGuideUrl?: string
  cancelGuideUrl?: string
  isManualGuide?: boolean
  manualGuideUrl?: string
}

type GlobalState = {
  appState: 'foreground' | 'background'
  CSInfo: CSInfo | null
  guideLinkInfo: GuideLinkInfo | null
  setAppState: (appState: GlobalState['appState']) => void
  setCSInfo: (CSInfo: CSInfo | null) => void
  setGuideLinkInfo: (guideLinkInfo: GuideLinkInfo | null) => void
}

export const useGlobalStore = create<GlobalState>((set) => ({
  appState: 'foreground',
  CSInfo: null,
  guideLinkInfo: null,
  setAppState: (appState) => set({ appState }),
  setCSInfo: (CSInfo) => set({ CSInfo }),
  setGuideLinkInfo: (guideLinkInfo) => set({ guideLinkInfo }),
}))
