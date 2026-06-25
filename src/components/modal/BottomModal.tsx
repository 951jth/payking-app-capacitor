import * as Dialog from '@radix-ui/react-dialog'
import type { PropsWithChildren } from 'react'
import { useBackOverlay } from '../../hooks/useBackOverlay'
import { PKText } from '../typography/PKText'

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
  const portalContainer = document.querySelector<HTMLElement>('.pk-modal-root')

  useBackOverlay(visible, onClose)

  return (
    <Dialog.Root open={visible} onOpenChange={(open) => !open && onClose?.()}>
      <Dialog.Portal container={portalContainer ?? undefined}>
        <Dialog.Overlay className={classes.overlay} />
        <Dialog.Content className={classes.content}>
          <div className={classes.handle} />
          {title && (
            <Dialog.Title asChild>
              <PKText as="h2" className={classes.title} weight={200}>
                {title}
              </PKText>
            </Dialog.Title>
          )}
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
    'absolute inset-0 z-[100] animate-[pk-fade-in_180ms_ease_both] bg-black/35',
  content:
    'absolute inset-x-0 bottom-0 z-[101] mx-auto max-h-[calc(100%_-_48px)] w-full overflow-hidden rounded-t-[32px] bg-white pt-6 animate-[pk-sheet-in_220ms_cubic-bezier(0.22,1,0.36,1)_both]',
  handle:
    'absolute top-2.5 left-1/2 h-1 w-[60px] -translate-x-1/2 rounded-sm bg-[var(--pk-border)]',
  title:
    'm-0 box-border w-full px-5 pb-1 pt-2 text-center text-[16px] leading-[1.2] text-[var(--pk-text)]',
  body: 'bg-white pb-[env(safe-area-inset-bottom)]',
  bodyScroll:
    'max-h-[calc(100svh-96px)] overflow-y-auto [-webkit-overflow-scrolling:touch]',
}
