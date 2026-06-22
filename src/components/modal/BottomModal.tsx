import * as Dialog from '@radix-ui/react-dialog'
import type { PropsWithChildren } from 'react'

type BottomModalProps = PropsWithChildren<{
  visible: boolean
  onClose?: () => void
  title?: string
  useScrollView?: boolean
}>

export function BottomModal({
  visible,
  onClose,
  title,
  children,
  useScrollView = true,
}: BottomModalProps) {
  return (
    <Dialog.Root open={visible} onOpenChange={(open) => !open && onClose?.()}>
      <Dialog.Portal>
        <Dialog.Overlay className={classes.overlay} />
        <Dialog.Content className={classes.content}>
          <div className={classes.handle} />
          {title && <Dialog.Title className={classes.title}>{title}</Dialog.Title>}
          <div className={[classes.body, useScrollView && classes.bodyScroll].filter(Boolean).join(' ')}>
            {children}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

const classes = {
  overlay:
    'fixed inset-0 z-[100] animate-[pk-fade-in_180ms_ease_both] bg-black/35',
  content:
    'fixed bottom-0 left-1/2 z-[101] max-h-[calc(100svh-48px)] w-[min(430px,100vw)] -translate-x-1/2 overflow-hidden rounded-t-[32px] bg-white pt-6 animate-[pk-sheet-in_220ms_cubic-bezier(0.22,1,0.36,1)_both]',
  handle:
    'absolute top-2.5 left-1/2 h-1 w-[60px] -translate-x-1/2 rounded-sm bg-[var(--pk-border)]',
  title: 'mx-5 mt-3 mb-1 text-base font-semibold text-[var(--pk-text)]',
  body: 'bg-white pb-[env(safe-area-inset-bottom)]',
  bodyScroll:
    'max-h-[calc(100svh-96px)] overflow-y-auto [-webkit-overflow-scrolling:touch]',
}
