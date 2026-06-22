import type { ActivityComponentType } from '@stackflow/react'
import { useMemo, useState } from 'react'
import { AppContainer, AppHeader, PKTabBar } from '../components'
import type { PKTabItem } from '../components'
import { mainTabScreens } from '../navigation/mainTabScreens'
import { useAppNavigation } from '../navigation/useAppNavigation'

const defaultTabName =
  mainTabScreens.find((screen) => screen.component)?.name ?? mainTabScreens[0]?.name ?? 'home'

export const HomeMainActivity: ActivityComponentType<'homeMain'> = () => {
  const navigation = useAppNavigation()
  const [activeTab, setActiveTab] = useState(defaultTabName)
  const activeScreen = useMemo(
    () => mainTabScreens.find((screen) => screen.name === activeTab),
    [activeTab],
  )
  const ActivePanel = activeScreen?.component

  const handleTabChange = (name: string, item: PKTabItem) => {
    if (item.navigate === false) return

    if (item.navigate) {
      navigation.navigate(item.navigate, {})
      return
    }

    if (item.component) {
      setActiveTab(name)
    }
  }

  return (
    <AppContainer
      bottomChildren={
        <PKTabBar
          activeName={activeTab}
          items={mainTabScreens}
          onChange={handleTabChange}
        />
      }
      bottomPadding={false}
      className={classes.screen}
      contentClassName={classes.content}
      topChildren={activeScreen?.useHeader ? <AppHeader title={activeScreen.title} /> : null}
      useScrollView={Boolean(activeScreen?.useHeader)}
    >
      {ActivePanel ? <ActivePanel /> : null}
    </AppContainer>
  )
}

const classes = {
  screen: 'h-full min-h-0 bg-[#f6f7f9]',
  content: 'p-0',
}
