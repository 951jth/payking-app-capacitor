import type { ReactNode } from 'react'
import { create } from 'zustand'

type ShowAlertParams = {
  title?: ReactNode
  contents?: ReactNode
  confirmTitle?: string
  onConfirm?: () => void
}

type AlertState = {
  visible: boolean
  title: ReactNode
  contents: ReactNode
  confirmTitle: string
  onConfirm: (() => void) | null
  showAlert: (params: ShowAlertParams) => void
  hideAlert: () => void
}

const initialAlertState = {
  visible: false,
  title: '',
  contents: '',
  confirmTitle: '확인',
  onConfirm: null as (() => void) | null,
}

export const useAlertStore = create<AlertState>((set) => ({
  ...initialAlertState,
  showAlert: ({ title = '', contents = '', confirmTitle = '확인', onConfirm }) =>
    set({
      visible: true,
      title,
      contents,
      confirmTitle,
      onConfirm: onConfirm ?? null,
    }),
  hideAlert: () => set({ ...initialAlertState }),
}))

export const alertStore = useAlertStore
