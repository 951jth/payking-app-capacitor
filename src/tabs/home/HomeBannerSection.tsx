import { PKBanner, PKBannerSkeleton, type PKBannerItem } from '../../components'
import { useAlertStore } from '../../stores/alertStore'

type HomeBannerSectionProps = {
  banners: PKBannerItem[]
  loading?: boolean
}

export function HomeBannerSection({ banners, loading = false }: HomeBannerSectionProps) {
  const showAlert = useAlertStore((state) => state.showAlert)

  if (loading) {
    return <PKBannerSkeleton className={classes.banner} />
  }

  if (banners.length === 0) return null

  return (
    <PKBanner
      className={classes.banner}
      interval={5000}
      items={banners}
      onPressItem={(_, item) => {
        if (item.bannerUrl) {
          window.open(item.bannerUrl, '_blank', 'noopener,noreferrer')
          return
        }

        showAlert({
          title: item.name || '배너',
          contents: '연결할 배너 링크가 없습니다.',
        })
      }}
    />
  )
}

const classes = {
  banner: 'shrink-0',
}
