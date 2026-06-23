import type { ActivityComponentType } from '@stackflow/react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import iconArrowRight from '../assets/icons/Icon_arrow_right_20.svg'
import iconMenuCard from '../assets/icons/Icon_menu_card.svg'
import iconMenuSetting from '../assets/icons/Icon_menu_setting.svg'
import iconSettingBell from '../assets/icons/Icon_setting_bell.svg'
import iconSettingCheck from '../assets/icons/Icon_setting_check.svg'
import iconSettingInfo from '../assets/icons/Icon_setting_info.svg'
import iconSettingLock from '../assets/icons/Icon_setting_lock.svg'
import iconSettingNoti from '../assets/icons/Icon_setting_noti.svg'
import iconSettingPayking from '../assets/icons/Icon_setting_payking.svg'
import iconSettingPeriod from '../assets/icons/Icon_setting_period.svg'
import iconSettingQuestion from '../assets/icons/Icon_setting_question.svg'
import {
  AppContainer,
  AppHeader,
  PKButton,
  PKChip,
  PKText,
  SettingItem,
} from '../components'
import { useAppLogout } from '../hooks/useAppLogout'
import { useAppNavigation } from '../navigation/useAppNavigation'
import { useAlertStore } from '../stores/alertStore'
import { useGlobalStore } from '../stores/globalStore'
import { useUserStore } from '../stores/userStore'
import { getAppVersion } from '../utils/appVersion'

export const SettingActivity: ActivityComponentType<'setting'> = () => {
  const navigation = useAppNavigation()
  const showAlert = useAlertStore((state) => state.showAlert)
  const handleLogout = useAppLogout()
  const user = useUserStore((state) => state.user)
  const agent = useUserStore((state) => state.agent)
  const loadHomeUserData = useUserStore((state) => state.loadHomeUserData)
  const guideLinkInfo = useGlobalStore((state) => state.guideLinkInfo)
  const [appVersion, setAppVersion] = useState('')

  const isManager = user?.authority === 'MANAGE'
  const hideWithdrawal = useMemo(
    () =>
      (agent?.agentType === 'RESELLER' || agent?.agentType === 'AGENCY') &&
      Boolean(agent?.withStore),
    [agent?.agentType, agent?.withStore],
  )

  const showComingSoon = useCallback(
    (label: string) => {
      showAlert({
        title: '준비 중',
        contents: `${label} 화면은 이후 단계에서 연결합니다.`,
      })
    },
    [showAlert],
  )

  useEffect(() => {
    void loadHomeUserData()
  }, [loadHomeUserData])

  useEffect(() => {
    void getAppVersion().then(setAppVersion)
  }, [])

  return (
    <AppContainer
      className={classes.screen}
      contentClassName={classes.content}
      topChildren={
        <>
          <AppHeader onBack={navigation.goBack} title="설정" />
          <button
            className={classes.accountHeader}
            disabled={!isManager}
            onClick={() => showComingSoon('계정 정보')}
            type="button"
          >
            <span className={classes.accountMain}>
              <span className={classes.accountTitleRow}>
                <PKText as="span" className={classes.accountName} weight={500}>
                  {agent?.name ?? '-'}
                </PKText>
                {isManager ? (
                  <img alt="" className={classes.accountArrow} src={iconArrowRight} />
                ) : null}
              </span>
              <PKText as="span" className={classes.accountId}>
                {user?.lastAuthId ?? '-'}
              </PKText>
            </span>
          </button>
        </>
      }
    >
      <section className={classes.section}>
        <SettingItem
          icon={<SettingIcon src={iconSettingLock} />}
          onPress={() => showComingSoon('비밀번호 변경')}
          subTitle="보안을 위해 주기적으로 변경하세요."
          title="비밀번호 변경"
        />
      </section>

      <section className={classes.sectionWithGap}>
        <PKText as="h2" className={classes.sectionTitle}>
          환경설정
        </PKText>
        <SettingItem
          icon={<SettingIcon src={iconSettingBell} />}
          onPress={() => showComingSoon('알림 설정')}
          subTitle="결제완료, 결제취소, 입금완료 알림"
          title="알림 설정"
        />
        <SettingItem
          icon={<SettingIcon src={iconMenuSetting} />}
          onPress={() => showComingSoon('결제 옵션 설정')}
          subTitle="상품명, 결제문구 등 설정"
          title="결제 옵션 설정"
        />
      </section>

      <section className={classes.sectionWithGap}>
        <PKText as="h2" className={classes.sectionTitle}>
          정보 및 서비스
        </PKText>
        <SettingItem
          icon={<SettingIcon src={iconSettingNoti} />}
          onPress={() => showComingSoon('공지사항')}
          subTitle="서비스 공지 및 업데이트 정보"
          title="공지사항"
        />
        <SettingItem
          icon={<SettingIcon src={iconMenuCard} />}
          onPress={() => showComingSoon('결제/입금 정보')}
          subTitle="카드결제 수수료율 안내"
          title="결제/입금 정보"
        />
        <SettingItem
          icon={<SettingIcon src={iconSettingPeriod} />}
          onPress={() => showComingSoon('익일 입금 신청')}
          subTitle="입금 신청 진행 정보"
          title="익일 입금 신청"
        />
      </section>

      <section className={classes.sectionWithGapLast}>
        <PKText as="h2" className={classes.sectionTitle}>
          기타
        </PKText>
        <SettingItem
          disabled
          icon={<SettingIcon src={iconSettingPayking} />}
          onPress={() => {}}
          postIcon={
            <PKChip
              backgroundColor="#E7E9EE"
              fontStyle={{ fontSize: 10, color: '#8B9099' }}
              label={appVersion ? `v${appVersion}` : 'v-'}
            />
          }
          title="앱 버전 정보"
        />
        {guideLinkInfo?.isManualGuide ? (
          <SettingItem
            icon={<SettingIcon src={iconSettingInfo} />}
            onPress={() => showComingSoon('이용안내')}
            title="이용안내"
          />
        ) : null}
        <SettingItem
          icon={<SettingIcon src={iconSettingCheck} />}
          onPress={() => showComingSoon('약관 및 개인정보처리방침')}
          title="약관 및 개인정보처리방침"
        />
        <SettingItem
          icon={<SettingIcon src={iconSettingQuestion} />}
          onPress={() => showComingSoon('자주 묻는 질문')}
          title="자주 묻는 질문"
        />
      </section>

      <div className={classes.footer}>
        <PKButton onClick={handleLogout} title="로그아웃" />
        {!hideWithdrawal ? (
          <>
            <span aria-hidden className={classes.footerDivider} />
            <PKButton
              onClick={() => showComingSoon('회원탈퇴')}
              title="회원탈퇴"
            />
          </>
        ) : null}
      </div>
    </AppContainer>
  )
}

function SettingIcon({ src }: { src: string }) {
  return <img alt="" className={classes.menuIcon} src={src} />
}

const classes = {
  screen: 'bg-white text-[var(--pk-text)]',
  content: 'px-5 pb-[calc(20px+env(safe-area-inset-bottom))] pt-0',
  accountHeader:
    'mx-5 flex w-[calc(100%-40px)] border-0 border-b border-[#1E1E1E] bg-transparent px-1 py-[15px] text-left disabled:cursor-default',
  accountMain: 'flex w-full flex-col gap-1',
  accountTitleRow: 'flex items-center justify-between gap-1',
  accountName: 'text-xl text-[var(--pk-text)]',
  accountArrow: 'block h-5 w-5 shrink-0',
  accountId: 'text-xs text-[#8B9099]',
  section: 'border-b border-[#E7E9EE] py-4',
  sectionWithGap: 'flex flex-col gap-4 border-b border-[#E7E9EE] py-4',
  sectionWithGapLast: 'flex flex-col gap-4 py-4',
  sectionTitle: 'm-0 text-sm font-normal text-[var(--pk-text)]',
  menuIcon: 'block h-9 w-9 object-contain',
  footer: 'mt-2 flex items-center justify-center gap-3',
  footerDivider: 'h-3 w-px shrink-0 bg-[#8B9099]',
}
