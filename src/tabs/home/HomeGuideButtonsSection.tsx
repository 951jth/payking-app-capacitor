import { PKButton } from '../../components'
import { useGlobalStore } from '../../stores/globalStore'
import { useAlertStore } from '../../stores/alertStore'

export function HomeGuideButtonsSection() {
  const guideLinkInfo = useGlobalStore((state) => state.guideLinkInfo)
  const showAlert = useAlertStore((state) => state.showAlert)

  if (!guideLinkInfo?.isPayGuide && !guideLinkInfo?.isCancelGuide) {
    return null
  }

  const openGuide = (title: string, url?: string) => {
    if (!url) {
      showAlert({
        title: '준비 중',
        contents: `${title} 링크는 webview activity 연결 후 열립니다.`,
      })
      return
    }

    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <section className={classes.section}>
      {guideLinkInfo?.isPayGuide && (
        <PKButton
          type="standard"
          className={classes.button}
          colorType="primary"
          onClick={() => openGuide('결제 방법', guideLinkInfo.payGuideUrl)}
          title="결제 방법"
        />
      )}
      {guideLinkInfo?.isCancelGuide && (
        <PKButton
          type="standard"
          className={classes.button}
          colorType="primary"
          onClick={() => openGuide('결제 취소 방법', guideLinkInfo.cancelGuideUrl)}
          title="결제 취소 방법"
        />
      )}
    </section>
  )
}

const classes = {
  section: 'flex gap-1.5',
  button: 'flex-1 bg-[#dbe8ff] text-[var(--pk-primary)]',
}
