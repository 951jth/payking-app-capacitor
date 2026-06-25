import { useEffect, useMemo, useState } from 'react'
import { PKText } from '../typography/PKText'

export type PKBannerItem = {
  id?: string | number
  fileUrl?: string
  uri?: string
  name?: string
  bannerUrl?: string
  [key: string]: unknown
}

type PKBannerProps = {
  items?: PKBannerItem[]
  height?: number
  interval?: number
  className?: string
  onPressItem?: (index: number, item: PKBannerItem) => void
}

type PKBannerSkeletonProps = {
  height?: number
  className?: string
}

export function PKBannerSkeleton({
  height = 70,
  className,
}: PKBannerSkeletonProps) {
  return (
    <div
      aria-busy="true"
      aria-label="배너 불러오는 중"
      className={[classes.wrapper, classes.skeleton, className]
        .filter(Boolean)
        .join(' ')}
      style={{ height }}
    >
      <div className={classes.skeletonShimmer} />
      <div aria-hidden className={classes.skeletonIndicator} />
    </div>
  )
}

export function PKBanner({
  items = [],
  height = 70,
  interval = 0,
  className,
  onPressItem,
}: PKBannerProps) {
  const [slideIndex, setSlideIndex] = useState(0)
  const normalizedItems = useMemo(() => items.filter(Boolean), [items])
  const hasItems = normalizedItems.length > 0
  const activeIndex = Math.min(slideIndex, Math.max(normalizedItems.length - 1, 0))

  useEffect(() => {
    if (!interval || normalizedItems.length <= 1) return

    const timer = window.setInterval(() => {
      setSlideIndex((current) => (current + 1) % normalizedItems.length)
    }, interval)

    return () => window.clearInterval(timer)
  }, [interval, normalizedItems.length])

  if (!hasItems) return null

  return (
    <section
      className={[classes.wrapper, className].filter(Boolean).join(' ')}
      style={{ height }}
    >
      <div
        className={classes.track}
        style={{ transform: `translateX(-${activeIndex * 100}%)` }}
      >
        {normalizedItems.map((item, index) => {
          const imageUrl = item.fileUrl || item.uri || ''
          const itemKey = item.id ?? `${imageUrl}-${index}`

          return (
            <button
              aria-label={item.name ? `${item.name} 배너 열기` : '배너 열기'}
              className={classes.slide}
              key={itemKey}
              onClick={() => onPressItem?.(index, item)}
              type="button"
            >
              {imageUrl ? (
                <img
                  alt={item.name || ''}
                  className={classes.image}
                  draggable={false}
                  src={imageUrl}
                />
              ) : (
                <div className={classes.emptyImage} />
              )}
            </button>
          )
        })}
      </div>

      <div className={classes.indicator}>
        <PKText as="span" className={classes.indicatorCurrent} weight={600}>
          {activeIndex + 1}
        </PKText>
        <PKText as="span" className={classes.indicatorTotal} weight={200}>
          {' '}
          / {normalizedItems.length}
        </PKText>
      </div>
    </section>
  )
}

const classes = {
  wrapper:
    'relative w-full shrink-0 overflow-hidden rounded-xl bg-[#e1e1e1]',
  track:
    'flex h-full w-full transition-transform duration-300 ease-out will-change-transform',
  slide:
    'h-full min-w-full border-0 bg-transparent p-0',
  image:
    'block h-full w-full rounded-xl object-contain',
  emptyImage:
    'h-full w-full rounded-xl bg-[#e1e1e1]',
  indicator:
    'absolute bottom-2 right-4 flex h-5 w-[50px] items-center justify-center rounded-[13px] bg-[#000d3e3d]',
  indicatorCurrent:
    'text-[10px] leading-none text-white',
  indicatorTotal:
    'text-[10px] leading-none text-white',
  skeleton: 'bg-[#eceef2]',
  skeletonShimmer: 'h-full w-full animate-pulse rounded-xl bg-[#dfe3ea]',
  skeletonIndicator:
    'absolute bottom-2 right-4 h-5 w-[50px] rounded-[13px] bg-[#d5dae3] animate-pulse',
}
