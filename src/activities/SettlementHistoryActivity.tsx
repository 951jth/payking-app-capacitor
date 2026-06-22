import type { ActivityComponentType } from '@stackflow/react'
import { AppContainer, AppHeader, PKText } from '../components'
import { useAppNavigation } from '../navigation/useAppNavigation'

export const SettlementHistoryActivity: ActivityComponentType<'settlementHistory'> = () => {
  const navigation = useAppNavigation()

  return (
    <AppContainer
      className={classes.screen}
      contentClassName={classes.content}
      topChildren={<AppHeader onBack={navigation.goBack} title="정산 현황" />}
    >
      <section className={classes.panel}>
        <PKText as="p">정산 현황 shell입니다. 필터와 목록은 이후 단계에서 이식합니다.</PKText>
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
