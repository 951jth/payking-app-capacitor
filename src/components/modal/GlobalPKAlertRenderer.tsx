import { PKAlert } from './PKAlert'
import { useAlertStore } from '../../stores/alertStore'

export function GlobalPKAlertRenderer() {
  const visible = useAlertStore((state) => state.visible)
  const title = useAlertStore((state) => state.title)
  const contents = useAlertStore((state) => state.contents)
  const confirmTitle = useAlertStore((state) => state.confirmTitle)
  const onConfirm = useAlertStore((state) => state.onConfirm)
  const hideAlert = useAlertStore((state) => state.hideAlert)

  const handleConfirm = () => {
    onConfirm?.()
    hideAlert()
  }

  return (
    <PKAlert
      confirmTitle={confirmTitle}
      contents={contents}
      onConfirm={handleConfirm}
      onOpenChange={(open) => {
        if (!open) hideAlert()
      }}
      title={title}
      visible={visible}
    />
  )
}
