import { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import type { PKBannerItem } from '../../components'
import mainBannerService from '../../service/mainBanner'
import notificationService from '../../service/notification'
import settlementService from '../../service/settlement'
import type { ApiResponse } from '../../service/axios'
import { useSessionStore } from '../../stores/sessionStore'
import { useUserStore } from '../../stores/userStore'

function getApiData<T>(response: { data?: unknown }): T | null {
  const payload = response.data as ApiResponse<T> | undefined
  if (payload?.data !== undefined && payload?.data !== null) {
    return payload.data as T
  }

  return null
}

export function useHomeTabData() {
  const accessToken = useSessionStore((state) => state.accessToken)
  const user = useUserStore((state) => state.user)
  const guaranteeInsurances = useUserStore((state) => state.guaranteeInsurances)
  const agentSettlementInfo = useUserStore((state) => state.agentSettlementInfo)
  const loadHomeUserData = useUserStore((state) => state.loadHomeUserData)
  const [noticeUnreadCount, setNoticeUnreadCount] = useState(0)
  const [todayAmount, setTodayAmount] = useState(0)
  const [banners, setBanners] = useState<PKBannerItem[]>([])
  const [bannersLoading, setBannersLoading] = useState(false)

  useEffect(() => {
    if (!accessToken) return

    void loadHomeUserData()
  }, [accessToken, loadHomeUserData])

  useEffect(() => {
    if (!accessToken) {
      setBanners([])
      setBannersLoading(false)
      return
    }

    let ignore = false
    setBannersLoading(true)

    void mainBannerService
      .getBanners({
        isUsable: true,
        isDeleted: false,
        siteType: 'ALL',
        bannerType: 'ROLLING',
        placementType: 'HOME',
      })
      .then((response) => {
        if (ignore) return

        const payload = response.data as ApiResponse<PKBannerItem[]> | undefined
        setBanners(Array.isArray(payload?.data) ? payload.data : [])
      })
      .catch((error) => {
        if (!ignore) {
          console.warn('홈 배너 조회 실패:', error)
        }
      })
      .finally(() => {
        if (!ignore) {
          setBannersLoading(false)
        }
      })

    return () => {
      ignore = true
    }
  }, [accessToken])

  useEffect(() => {
    if (!user?.userNo) return

    void notificationService
      .getMyNotificationUnReadCount({
        fromDate: dayjs().subtract(1, 'week').format('YYYYMMDD'),
        toDate: dayjs().format('YYYYMMDD'),
        userNo: user.userNo,
      })
      .then((response) => {
        const count = getApiData<number>(response)
        setNoticeUnreadCount(typeof count === 'number' ? count : 0)
      })
      .catch((error) => {
        console.warn('알림 미읽음 수 조회 실패:', error)
      })
  }, [user?.userNo])

  useEffect(() => {
    if (!accessToken) return

    void settlementService
      .getMySettlementStatusAmountStats({
        searchDateType: 'SETTLED',
        statuses: ['EXPECTED', 'COMPLETED'],
        fromDate: dayjs().format('YYYYMMDD'),
        toDate: dayjs().format('YYYYMMDD'),
      })
      .then((response) => {
        const stats = getApiData<Array<{ totalAmount?: number }>>(response) ?? []
        const amount = stats.reduce((acc, item) => acc + (item?.totalAmount ?? 0), 0)
        setTodayAmount(amount)
      })
      .catch((error) => {
        console.warn('오늘 정산 금액 조회 실패:', error)
      })
  }, [accessToken])

  return {
    user,
    guaranteeInsurances,
    agentSettlementInfo,
    noticeUnreadCount,
    todayAmount,
    banners,
    bannersLoading,
  }
}
