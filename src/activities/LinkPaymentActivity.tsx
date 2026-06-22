import type { ActivityComponentType } from '@stackflow/react'
import { AppContainer, AppHeader, PKText } from '../components'
import { useAppNavigation } from '../navigation/useAppNavigation'

export const LinkPaymentActivity: ActivityComponentType<'linkPayment'> = () => {
  const navigation = useAppNavigation()

  return (
    <AppContainer
      className={classes.screen}
      contentClassName={classes.content}
      topChildren={<AppHeader onBack={navigation.goBack} title="링크/QR코드 결제" />}
    >
      <section className={classes.panel}>
        <PKText as="p">링크/QR 결제 shell입니다. RN LinkPaymentsScreen은 이후 단계에서 이식합니다.</PKText>
      </section>
    </AppContainer>
  )
}

const classes = {
  screen: 'bg-[#f6f7f9] text-[var(--pk-text)]',
  content: 'p-5',
  panel:
    'rounded-lg border border-[var(--pk-border)] bg-white p-5 [&_.pk-text]:m-0 [&_.pk-text]:text-sm [&_.pk-text]:leading-[1.55] [&_.pk-text]:text-[#575e6b]',
}
