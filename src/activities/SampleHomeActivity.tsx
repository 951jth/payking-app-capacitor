import type { ActivityComponentType } from '@stackflow/react'
import { useState } from 'react'
import { CreditCard, Home, Menu, QrCode, WalletCards } from 'lucide-react'
import {
  AppContainer,
  PKButton,
  PKConfirm,
  PKInput,
  PKTabBar,
  PKText,
} from '../components'
import { useAppNavigation } from '../navigation/useAppNavigation'
import { useAlertStore } from '../stores/alertStore'

export const SampleHomeActivity: ActivityComponentType<'sampleHome'> = () => {
  const navigation = useAppNavigation()
  const [id, setId] = useState('')
  const [password, setPassword] = useState('')
  const [activeTab, setActiveTab] = useState('home')
  const [confirmVisible, setConfirmVisible] = useState(false)
  const showAlert = useAlertStore((state) => state.showAlert)

  return (
    <AppContainer
      bottomChildren={
        <div className={classes.bottomStack}>
          <PKButton
            buttonType="standard"
            disabled={!id || !password}
            onClick={() =>
              showAlert({
                title: '로그인',
                contents: '공통 알림 컴포넌트 연결 샘플입니다.',
              })
            }
            title="로그인"
          />
          <PKButton
            buttonType="outline"
            colorType="primary"
            onClick={() =>
              navigation.navigate('sampleDetail', {
                source: 'sampleHome',
              })
            }
            title="샘플 상세로 이동"
          />
        </div>
      }
      className={classes.screen}
      contentClassName={classes.content}
    >
      <section className={classes.main}>
        <div className={classes.logo}>PayKing</div>
        <div className={classes.copy}>
          <PKText as="p">써본 사람만 알아요.</PKText>
          <PKText as="p">이 편함, 지금 경험해보세요.</PKText>
        </div>

        <div className={classes.form}>
          <PKInput
            aria-label="아이디"
            onChangeText={setId}
            placeholder="아이디"
            type="id"
            value={id}
          />
          <PKInput
            aria-label="비밀번호"
            onChangeText={setPassword}
            placeholder="비밀번호"
            type="password"
            value={password}
          />
        </div>

        <div className={classes.links}>
          <PKButton onClick={() => setConfirmVisible(true)} title="문의하기" />
          <div>
            <PKButton title="아이디 찾기" />
            <span>|</span>
            <PKButton title="비밀번호 찾기" />
          </div>
        </div>

        <div className={classes.tabbar}>
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
        </div>
      </section>

      <PKConfirm
        contents="고객센터 연결은 이후 공통 기반 단계에서 연동합니다."
        onConfirm={() => setConfirmVisible(false)}
        onOpenChange={setConfirmVisible}
        onReject={() => setConfirmVisible(false)}
        title="문의하기"
        visible={confirmVisible}
      />
    </AppContainer>
  )
}

const classes = {
  screen: 'bg-white text-[var(--pk-text)]',
  content:
    'box-border mx-auto flex w-full flex-col justify-center px-[30px] pb-8 pt-[54px]',
  main: 'w-full',
  logo:
    'mb-6 text-center font-[var(--pk-font-ptd)] text-[30px] font-extrabold text-[var(--pk-primary)]',
  copy:
    'mb-[38px] grid gap-2 leading-tight [&_.pk-text]:m-0 [&_.pk-text]:text-center [&_.pk-text]:text-sm',
  form: 'mb-3 grid gap-4',
  links:
    'flex justify-between gap-3 px-1 text-xs text-[var(--pk-muted)] [&>div]:flex [&>div]:items-center [&>div]:gap-3',
  tabbar: 'mx-[-30px] mt-[34px] shadow-[0_-1px_0_rgba(0,0,0,0.04)]',
  bottomStack: 'grid gap-2.5',
}
