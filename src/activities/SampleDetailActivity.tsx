import type { ActivityComponentType } from '@stackflow/react'
import { useActivityParams } from '@stackflow/react'
import { AppContainer, AppHeader, BottomModal, PKButton, PKText } from '../components'
import { useAppNavigation } from '../navigation/useAppNavigation'
import { useState } from 'react'

export const SampleDetailActivity: ActivityComponentType<'sampleDetail'> = () => {
  const navigation = useAppNavigation()
  const params = useActivityParams<'sampleDetail'>()
  const [modalVisible, setModalVisible] = useState(false)

  return (
    <AppContainer
      className={classes.screen}
      topChildren={<AppHeader onBack={navigation.goBack} title="샘플 상세" />}
    >
      <section className={classes.panel}>
        <PKText as="h2">Stackflow activity</PKText>
        <PKText as="p">
          `navigation.navigate('sampleDetail', params)` 형태의 이동을 확인하기
          위한 샘플 페이지입니다.
        </PKText>
        <dl className={classes.descriptionList}>
          <dt className={classes.descriptionTerm}>source</dt>
          <dd className={classes.descriptionValue}>{params.source}</dd>
        </dl>
        <PKButton
          buttonType="standard"
          className={classes.panelButton}
          onClick={() => setModalVisible(true)}
          title="바텀 모달 열기"
        />
      </section>
      <BottomModal
        onClose={() => setModalVisible(false)}
        title="바텀 모달"
        visible={modalVisible}
      >
        <div className={classes.bottomModalContent}>
          <PKText as="p">
            `BottomModal`은 이후 선택 목록, 필터, 약관, 액션 시트에 공통으로
            사용합니다.
          </PKText>
          <PKButton
            buttonType="standard"
            onClick={() => setModalVisible(false)}
            title="닫기"
          />
        </div>
      </BottomModal>
    </AppContainer>
  )
}

const classes = {
  screen: 'mx-auto bg-white text-[var(--pk-text)]',
  panel:
    'm-5 rounded-lg border border-[var(--pk-border)] bg-white p-5 [&_.pk-text:is(h2)]:mb-3 [&_.pk-text:is(h2)]:block [&_.pk-text:is(h2)]:text-lg [&_.pk-text:is(h2)]:font-semibold [&_.pk-text:is(p)]:mb-5 [&_.pk-text:is(p)]:block [&_.pk-text:is(p)]:text-sm [&_.pk-text:is(p)]:leading-[1.55] [&_.pk-text:is(p)]:text-[#575e6b]',
  descriptionList: 'm-0 grid grid-cols-[72px_1fr] gap-2 text-sm',
  descriptionTerm: 'text-[var(--pk-muted)]',
  descriptionValue: 'm-0 font-bold text-[var(--pk-text)]',
  panelButton: 'mt-6',
  bottomModalContent:
    'grid gap-5 p-5 [&_.pk-text]:m-0 [&_.pk-text]:leading-[1.55] [&_.pk-text]:text-[#575e6b]',
}
