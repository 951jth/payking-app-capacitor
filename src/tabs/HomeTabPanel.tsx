import { HomeActionCardsSection } from "./home/HomeActionCardsSection";
import { HomeBannerSection } from "./home/HomeBannerSection";
import { HomeFaqSection } from "./home/HomeFaqSection";
import { HomeGreetingSection } from "./home/HomeGreetingSection";
import { HomeGuideButtonsSection } from "./home/HomeGuideButtonsSection";
import { HomeHeader } from "./home/HomeHeader";
import { HomeSettlementSection } from "./home/HomeSettlementSection";
import { useHomeTabData } from "./home/useHomeTabData";

export function HomeTabPanel() {
  const {
    user,
    guaranteeInsurances,
    agentSettlementInfo,
    noticeUnreadCount,
    todayAmount,
    banners,
  } = useHomeTabData();

  return (
    <div className={classes.root}>
      <HomeHeader noticeUnreadCount={noticeUnreadCount} />
      <div className={classes.content}>
        <HomeGreetingSection agentSettlementInfo={agentSettlementInfo} user={user} />
        <HomeSettlementSection
          guaranteeInsurances={guaranteeInsurances}
          todayAmount={todayAmount}
        />
        <HomeActionCardsSection />
        <HomeBannerSection banners={banners} />
        <HomeGuideButtonsSection />
        <HomeFaqSection />
      </div>
    </div>
  );
}

const classes = {
  root: 'flex h-full min-h-0 flex-col overflow-hidden bg-white',
  content:
    'flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-y-contain px-5 pb-6 [-webkit-overflow-scrolling:touch]',
};
