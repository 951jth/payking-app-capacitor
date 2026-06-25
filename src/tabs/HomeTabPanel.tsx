import type { UIEvent } from 'react'
import { useEffect, useRef, useState } from 'react'
import type { PersistentBottomSheetState } from '../components'
import { HomeActionCardsSection } from './home/HomeActionCardsSection'
import { HomeBannerSection } from './home/HomeBannerSection'
import { HomeFaqSection } from './home/HomeFaqSection'
import { HomeGreetingSection } from './home/HomeGreetingSection'
import { HomeGuideButtonsSection } from './home/HomeGuideButtonsSection'
import { HomeHeader } from './home/HomeHeader'
import { HomeRecentPaymentSheet } from './home/HomeRecentPaymentSheet'
import { HomeSettlementSection } from './home/HomeSettlementSection'
import { useHomeTabData } from './home/useHomeTabData'

export function HomeTabPanel() {
  const scrollTopRef = useRef(0)
  const scrollStopTimerRef = useRef<number | null>(null)
  const [sheetState, setSheetState] =
    useState<PersistentBottomSheetState>('collapsed')
  const {
    user,
    guaranteeInsurances,
    agentSettlementInfo,
    noticeUnreadCount,
    todayAmount,
    banners,
    bannersLoading,
  } = useHomeTabData()

  useEffect(() => {
    return () => {
      if (scrollStopTimerRef.current) {
        window.clearTimeout(scrollStopTimerRef.current)
      }
    }
  }, [])

  const showCollapsedSheet = () => {
    setSheetState((current) => (current === 'open' ? current : 'collapsed'))
  }

  const handleContentScroll = (event: UIEvent<HTMLDivElement>) => {
    const currentTop = event.currentTarget.scrollTop
    const previousTop = scrollTopRef.current
    const delta = currentTop - previousTop

    if (Math.abs(delta) > 2) {
      setSheetState((current) => {
        if (current === 'open') return current
        return delta > 0 ? 'hidden' : 'collapsed'
      })
    }

    scrollTopRef.current = currentTop

    if (scrollStopTimerRef.current) {
      window.clearTimeout(scrollStopTimerRef.current)
    }

    scrollStopTimerRef.current = window.setTimeout(showCollapsedSheet, 500)
  }

  return (
    <div className={classes.root}>
      <HomeHeader noticeUnreadCount={noticeUnreadCount} />
      <div className={classes.content} onScroll={handleContentScroll}>
        <HomeGreetingSection agentSettlementInfo={agentSettlementInfo} user={user} />
        <HomeSettlementSection
          guaranteeInsurances={guaranteeInsurances}
          todayAmount={todayAmount}
        />
        <HomeActionCardsSection />
        <HomeBannerSection banners={banners} loading={bannersLoading} />
        <HomeGuideButtonsSection />
        <HomeFaqSection />
      </div>
      <HomeRecentPaymentSheet onStateChange={setSheetState} state={sheetState} />
    </div>
  )
}

const classes = {
  root: 'relative flex h-full min-h-0 flex-col overflow-hidden bg-white',
  content:
    'flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-y-contain px-5 pb-[96px] [-webkit-overflow-scrolling:touch]',
}
