import { useEffect, useId } from 'react'
import type { ActivityName } from '../navigation/activityRegistry'
import { useTopActivity } from '../navigation/useTopActivity'
import { useOverlayStore } from '../stores/overlayStore'

type UseBackOverlayOptions = {
  /** 지정 시 해당 activity가 최상단일 때만 overlay 등록 (예: mainTab 탭 전환) */
  topActivity?: ActivityName
}

/**
 * 뒤로가기 시 우선 처리할 닫기 동작을 overlayStore에 등록한다.
 *
 * performBackNavigation()은 알림 → overlayStore.closeTop() → stack pop 순으로 처리하므로,
 * 모달·바텀시트·비홈 탭 등 "닫기/되돌리기"가 화면 pop보다 먼저 실행된다.
 *
 * @param visible - true일 때만 등록 (예: 모달 open, 홈 탭이 아닐 때)
 * @param onClose - 뒤로가기 1회에 호출될 콜백 (모달 닫기, 홈 탭 전환 등)
 * @param options.topActivity - 최상단 activity가 일치할 때만 등록
 */
export function useBackOverlay(
  visible: boolean,
  onClose?: () => void,
  options?: UseBackOverlayOptions,
) {
  const overlayId = useId()
  const topActivity = useTopActivity()
  const register = useOverlayStore((state) => state.register)
  const unregister = useOverlayStore((state) => state.unregister)
  const isTopActivityMatch =
    options?.topActivity == null || topActivity?.name === options.topActivity
  const shouldRegister = visible && onClose && isTopActivityMatch

  useEffect(() => {
    if (!shouldRegister) return

    register({ id: overlayId, onClose })

    return () => {
      unregister(overlayId)
    }
  }, [shouldRegister, onClose, overlayId, register, unregister])
}
