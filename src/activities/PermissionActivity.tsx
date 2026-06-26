import type { ActivityComponentType } from '@stackflow/react'
import { useState } from 'react'
import iconBell from '../assets/icons/Icon_bell.svg'
import iconCamera from '../assets/icons/Icon_camera.svg'
import iconFolder from '../assets/icons/Icon_forder.svg'
import iconPhone from '../assets/icons/Icon_phone.svg'
import { openAppSettings } from '../adapters/permissionAdapter'
import { PKButton } from '../components/button/PKButton'
import { AppContainer } from '../components/layout/AppContainer'
import { PKConfirm } from '../components/modal/PKConfirm'
import { PKText } from '../components/typography/PKText'
import { usePermissionStore } from '../stores/permissionStore'

type PermissionItemProps = {
  description: string
  icon: string
  title: string
}

function PermissionItem({ description, icon, title }: PermissionItemProps) {
  return (
    <div className={classes.permissionItem}>
      <img alt="" className={classes.permissionIcon} src={icon} />
      <div className={classes.permissionCopy}>
        <PKText as="span" className={classes.permissionTitle} weight={500}>
          {title}
        </PKText>
        <PKText as="span" className={classes.permissionDescription} weight={400}>
          {description}
        </PKText>
      </div>
    </div>
  )
}

export const PermissionActivity: ActivityComponentType<'permission'> = () => {
  const checking = usePermissionStore((state) => state.checking)
  const requestPermissions = usePermissionStore(
    (state) => state.requestPermissions,
  )
  const [showSettingsConfirm, setShowSettingsConfirm] = useState(false)

  const handleConfirm = async () => {
    if (checking) return

    try {
      const snapshot = await requestPermissions()
      if (!snapshot.requiredGranted) setShowSettingsConfirm(true)
    } catch (error) {
      console.warn('앱 권한 요청 실패:', error)
      setShowSettingsConfirm(true)
    }
  }

  const handleOpenSettings = () => {
    setShowSettingsConfirm(false)
    void openAppSettings()
  }

  return (
    <>
      <AppContainer
        bottomChildren={
          <PKButton
            type="rounded"
            className={classes.confirmButton}
            colorType="solid-primary"
            loading={checking}
            onClick={handleConfirm}
            textClassName={classes.buttonText}
            title="확인"
          />
        }
        className={classes.screen}
        contentClassName={classes.content}
        useScrollView={false}
      >
        <PKText as="h1" className={classes.heading} weight={500}>
          앱 사용을 위해
          <br />
          접근 권한을 허용해주세요.
        </PKText>

        <div className={classes.permissionGroups}>
          <section className={classes.permissionGroup}>
            <PKText as="span" className={classes.groupTitle} weight={500}>
              필수
            </PKText>
            <PermissionItem
              description="데이터 캐싱 및 파일 읽기 또는 저장, 글작성"
              icon={iconFolder}
              title="저장공간 (사진/미디어/파일)"
            />
            <PermissionItem
              description="결제수단 등록 사진 촬영"
              icon={iconCamera}
              title="카메라"
            />
          </section>

          <section className={classes.permissionGroup}>
            <PKText as="span" className={classes.groupTitle} weight={500}>
              선택
            </PKText>
            <PermissionItem
              description="연락처"
              icon={iconPhone}
              title="전화"
            />
            <PermissionItem
              description="알림 메시지 발송(푸시 수신)"
              icon={iconBell}
              title="알림"
            />
          </section>
        </div>
      </AppContainer>

      <PKConfirm
        confirmColorType="solid-primary"
        confirmTitle="설정으로 이동"
        contents="필수 권한이 차단되어 있습니다. 설정에서 카메라와 사진 권한을 허용해주세요."
        onConfirm={handleOpenSettings}
        onOpenChange={setShowSettingsConfirm}
        onReject={() => setShowSettingsConfirm(false)}
        rejectTitle="닫기"
        title="권한 필요"
        visible={showSettingsConfirm}
      />
    </>
  )
}

const classes = {
  screen: 'bg-white',
  content: 'flex flex-1 flex-col px-5 pt-[88px]',
  heading:
    'm-0 mb-9 text-[18px] leading-[32px] text-[#191919]',
  permissionGroups: 'grid gap-9',
  permissionGroup: 'grid gap-[15px]',
  groupTitle: 'text-[15px] text-[#145ED9]',
  permissionItem: 'flex items-center gap-1',
  permissionIcon: 'h-9 w-9 shrink-0',
  permissionCopy: 'grid gap-[7px] pt-2.5',
  permissionTitle: 'text-[15px] text-[#1B1C1D]',
  permissionDescription: 'text-[12px] text-[#99A2B0]',
  confirmButton: 'h-[60px]',
  buttonText: 'text-[16px] font-bold text-white',
}
