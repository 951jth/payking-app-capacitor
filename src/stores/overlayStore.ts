import { create } from 'zustand'

type OverlayEntry = {
  id: string
  onClose: () => void
}

type OverlayState = {
  stack: OverlayEntry[]
  register: (entry: OverlayEntry) => void
  unregister: (id: string) => void
  closeTop: () => boolean
  hasOverlay: () => boolean
}

export const useOverlayStore = create<OverlayState>((set, get) => ({
  stack: [],
  register: (entry) =>
    set((state) => ({
      stack: [...state.stack.filter((item) => item.id !== entry.id), entry],
    })),
  unregister: (id) =>
    set((state) => ({
      stack: state.stack.filter((item) => item.id !== id),
    })),
  closeTop: () => {
    const top = get().stack.at(-1)
    if (!top) return false

    top.onClose()
    return true
  },
  hasOverlay: () => get().stack.length > 0,
}))

export const overlayStore = useOverlayStore
