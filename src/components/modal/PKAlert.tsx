import * as AlertDialog from '@radix-ui/react-alert-dialog'
import type { ReactNode } from 'react'
import { PKButton } from '../button/PKButton'
import { PKText } from '../typography/PKText'

type PKAlertProps = {
  title?: ReactNode
  contents?: ReactNode
  visible: boolean
  confirmTitle?: string
  onConfirm?: () => void
  onOpenChange?: (open: boolean) => void
}

export function PKAlert({
  title,
  contents,
  visible,
  confirmTitle = '확인',
  onConfirm,
  onOpenChange,
}: PKAlertProps) {
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
                <div className={classes.description}>{contents}</div>
              )}
            </AlertDialog.Description>
          )}
          <div className={classes.actions}>
            <AlertDialog.Action asChild>
              <PKButton
                type="standard"
                colorType="primary"
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
