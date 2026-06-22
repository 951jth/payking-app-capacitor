import type { ActivityComponentType } from '@stackflow/react'
import { AxiosError } from 'axios'
import { CreditCard, Home, LogOut, Menu, QrCode, WalletCards } from 'lucide-react'
import { useEffect, useState } from 'react'
import { AppContainer, AppHeader, PKButton, PKTabBar, PKText } from '../components'
import { useAppNavigation } from '../navigation/useAppNavigation'
import userService from '../service/user'
import type { ApiResponse } from '../service/axios'
import { useSessionStore } from '../stores/sessionStore'

export const UserHomeActivity: ActivityComponentType<'userHome'> = () => {
  const navigation = useAppNavigation()
  const [activeTab, setActiveTab] = useState('home')
  const [myInfoStatus, setMyInfoStatus] = useState('인증 API 확인 전')
  const [myInfoLoading, setMyInfoLoading] = useState(true)
  const logout = useSessionStore((state) => state.logout)

  const handleLogout = () => {
    logout()
    navigation.replace('login', {})
  }

  const requestMyInfoStatus = async () => {
    const response = await userService.getMyInfo({})
    const userName = getUserName(response.data)

    return userName ? `인증 API 연결 성공: ${userName}` : '인증 API 연결 성공'
  }

  const loadMyInfo = async () => {
    setMyInfoLoading(true)

    try {
      setMyInfoStatus(await requestMyInfoStatus())
    } catch (error) {
      setMyInfoStatus(getAuthSampleErrorMessage(error))
    } finally {
      setMyInfoLoading(false)
    }
  }

  useEffect(() => {
    let canceled = false

    void requestMyInfoStatus()
      .then((status) => {
        if (!canceled) setMyInfoStatus(status)
      })
      .catch((error) => {
        if (!canceled) setMyInfoStatus(getAuthSampleErrorMessage(error))
      })
      .finally(() => {
        if (!canceled) setMyInfoLoading(false)
      })

    return () => {
      canceled = true
    }
  }, [])

  return (
    <AppContainer
      bottomChildren={
        <PKTabBar
          activeName={activeTab}
          items={[
            { name: 'home', title: '홈', icon: <Home size={22} /> },
            { name: 'payHistory', title: '결제현황', icon: <CreditCard size={22} /> },
            { name: 'qrCode', icon: <QrCode size={28} /> },
            {
              name: 'settleHistory',
              title: '정산현황',
              icon: <WalletCards size={22} />,
            },
            { name: 'myPage', title: '메뉴', icon: <Menu size={22} /> },
          ]}
          onChange={setActiveTab}
        />
      }
      bottomPadding={false}
      className={classes.screen}
      contentClassName={classes.content}
      topChildren={
        <AppHeader
          right={
            <button
              aria-label="로그아웃"
              className={classes.logoutButton}
              onClick={handleLogout}
              type="button"
            >
              <LogOut size={18} />
            </button>
          }
          title="홈"
        />
      }
    >
      <section className={classes.panel}>
        <PKText as="h2">유저 전용 샘플 페이지</PKText>
        <PKText as="p">
          로그인 성공 후 진입할 인증 사용자 전용 activity입니다. 이후
          `homeMain` 탭 shell로 확장합니다.
        </PKText>
        <div className={classes.authSample}>
          <PKText as="p">{myInfoStatus}</PKText>
          <PKButton
            buttonType="outline"
            colorType="primary"
            loading={myInfoLoading}
            onClick={loadMyInfo}
            title="인증 API 재호출"
          />
        </div>
        <PKButton
          buttonType="outline"
          colorType="primary"
          onClick={() => navigation.navigate('sampleDetail', { source: 'userHome' })}
          title="상세 화면 이동 테스트"
        />
      </section>
    </AppContainer>
  )
}

function getUserName(responseData: unknown) {
  if (!responseData || typeof responseData !== 'object') return null

  const payload = responseData as {
    data?: {
      name?: unknown
      userName?: unknown
      username?: unknown
    }
  }
  const name =
    payload.data?.name ?? payload.data?.userName ?? payload.data?.username

  return typeof name === 'string' ? name : null
}

function getAuthSampleErrorMessage(error: unknown) {
  if (error instanceof AxiosError) {
    const response = error.response?.data as ApiResponse | undefined
    const systemMessage = response?.meta?.systemMessage
    const userMessage = response?.meta?.userMessage

    if (typeof userMessage === 'string' && userMessage) {
      return `인증 API 실패: ${userMessage}`
    }

    if (typeof systemMessage === 'string' && systemMessage) {
      return `인증 API 실패: ${systemMessage}`
    }
  }

  if (error instanceof Error && error.message) {
    return `인증 API 실패: ${error.message}`
  }

  return '인증 API 실패'
}

const classes = {
  screen: 'bg-[#f6f7f9]',
  content: 'p-5',
  logoutButton:
    'inline-flex h-14 w-14 items-center justify-center border-0 bg-transparent text-[#191919]',
  panel:
    'rounded-lg border border-[var(--pk-border)] bg-white p-5 [&_.pk-text:is(h2)]:mb-3 [&_.pk-text:is(h2)]:block [&_.pk-text:is(h2)]:text-lg [&_.pk-text:is(h2)]:font-semibold [&_.pk-text:is(p)]:mb-6 [&_.pk-text:is(p)]:block [&_.pk-text:is(p)]:text-sm [&_.pk-text:is(p)]:leading-[1.55] [&_.pk-text:is(p)]:text-[#575e6b]',
  authSample:
    'mb-4 rounded-md border border-[#dce1e8] bg-[#f9fafb] p-3 [&_.pk-text]:mb-3 [&_.pk-text]:text-xs',
}
