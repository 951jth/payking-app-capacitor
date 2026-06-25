import * as AlertDialog from '@radix-ui/react-alert-dialog'
import type { ReactNode } from 'react'
import { useCallback } from 'react'
import { useBackOverlay } from '../../hooks/useBackOverlay'
import { PKButton } from '../button/PKButton'
import { PKText } from '../typography/PKText'

type PKConfirmProps = {
  title?: ReactNode
  contents?: ReactNode
  visible: boolean
  rejectTitle?: string
  confirmTitle?: string
  rejectColorType?: 'primary' | 'warning' | 'disable'
  confirmColorType?: 'primary' | 'warning' | 'solid-primary' | 'solid-red'
  contentsClassName?: string
  onReject?: () => void
  onConfirm?: () => void
  onOpenChange?: (open: boolean) => void
}

export function PKConfirm({
  title,
  contents,
  visible,
  rejectTitle = '닫기',
  confirmTitle = '확인',
  rejectColorType = 'disable',
  confirmColorType = 'primary',
  contentsClassName,
  onReject,
  onConfirm,
  onOpenChange,
}: PKConfirmProps) {
  const handleDismiss = useCallback(() => {
    onReject?.()
    onOpenChange?.(false)
  }, [onOpenChange, onReject])

  useBackOverlay(visible, handleDismiss)

  return (
    <AlertDialog.Root open={visible} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className={classes.overlay} />
        <AlertDialog.Content className={classes.content}>
          {title && (
            <AlertDialog.Title asChild>
              {typeof title === 'string' ? (
                <PKText as="h2" className={classes.title}>
                  {title}
                </PKText>
              ) : (
                title
              )}
            </AlertDialog.Title>
          )}
          {contents && (
            <AlertDialog.Description asChild>
              {typeof contents === 'string' ? (
                <PKText as="p" className={classes.description}>
                  {contents}
                </PKText>
              ) : (
                <div
                  className={[classes.description, contentsClassName]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {contents}
                </div>
              )}
            </AlertDialog.Description>
          )}
          <div className={classes.actions}>
            <AlertDialog.Cancel asChild>
              <PKButton
                buttonType="standard"
                colorType={rejectColorType}
                onClick={onReject}
                title={rejectTitle}
              />
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <PKButton
                buttonType="standard"
                colorType={confirmColorType}
                onClick={onConfirm}
                title={confirmTitle}
              />
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}

const classes = {
  overlay:
    'fixed inset-0 z-[100] animate-[pk-fade-in_180ms_ease_both] bg-black/35',
  content:
    'fixed top-1/2 left-1/2 z-[101] box-border w-[min(344px,calc(100vw-64px))] -translate-x-1/2 -translate-y-1/2 rounded-[20px] bg-white px-4 pt-9 pb-4 text-center animate-[pk-dialog-in_180ms_ease_both]',
  title: 'mb-6 block text-xl font-medium leading-[1.2]',
  description:
    'mb-6 block text-sm font-extralight leading-normal text-[var(--pk-text)]',
  actions: 'flex gap-2',
}
