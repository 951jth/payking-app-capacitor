import type { UIEvent } from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import settlement from '../service/settlement'
import { useAlertStore } from '../stores/alertStore'
import { useUserStore } from '../stores/userStore'
import type { SettlementListItem } from '../types/settlement'
import { getApiPayload, getRangeDateForOption } from '../utils/paymentHistory'
import type { PaymentHistoryRangeOption } from '../utils/paymentHistory'
import { createSettlementInitFilter } from '../utils/settlementHistory.constants'
import {
  getSettlementHistoryErrorMessage,
  getSettlementHistoryParams,
  type SettlementHistoryFilter,
  type SettlementHistorySort,
} from '../utils/settlementHistory'

export function useSettlementHistoryData() {
  const showAlert = useAlertStore((state) => state.showAlert)
  const agentSettlementInfo = useUserStore((state) => state.agentSettlementInfo)
  const loadHomeUserData = useUserStore((state) => state.loadHomeUserData)

  const [filter, setFilter] = useState(createSettlementInitFilter)
  const [modalFilter, setModalFilter] = useState(createSettlementInitFilter)
  const [sort, setSort] = useState<SettlementHistorySort>('settlementDate,DESC')
  const [settlementList, setSettlementList] = useState<SettlementListItem[]>([])
  const [listLoading, setListLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [openFilter, setOpenFilter] = useState(false)
  const [summaryReloadSignal, setSummaryReloadSignal] = useState(0)

  const currentPage = useRef(0)
  const loadingRef = useRef(false)

  const settlementPeriod = agentSettlementInfo?.settlementPeriod ?? 3

  const currentParams = useMemo(
    () => getSettlementHistoryParams({ filter, sort, page: 0 }),
    [filter, sort],
  )

  const showLoadError = useCallback(
    (error: unknown) => {
      showAlert({
        title: '정산 현황',
        contents: getSettlementHistoryErrorMessage(error),
      })
    },
    [showAlert],
  )

  const loadSettlementList = useCallback(
    async (
      params: ReturnType<typeof getSettlementHistoryParams>,
      options: { append?: boolean } = {},
    ) => {
      if (!params || loadingRef.current) return

      loadingRef.current = true
      setListLoading(!options.append)
      setLoadingMore(Boolean(options.append))

      try {
        const response = await settlement.getMySettlementSearch(params)
        const payload = getApiPayload<SettlementListItem[]>(response)
        const list = Array.isArray(payload.data) ? payload.data : []

        setSettlementList((prev) => (options.append ? [...prev, ...list] : list))
        setTotalCount(Number(payload.meta?.totalCount ?? list.length))
        currentPage.current = Number(params.page ?? 0)
      } catch (error) {
        showLoadError(error)
      } finally {
        loadingRef.current = false
        setListLoading(false)
        setLoadingMore(false)
      }
    },
    [showLoadError],
  )

  useEffect(() => {
    void loadHomeUserData()
  }, [loadHomeUserData])

  useEffect(() => {
    void loadSettlementList(currentParams)
  }, [currentParams, loadSettlementList])

  const openFilterModal = () => {
    setModalFilter({ ...filter })
    setOpenFilter(true)
  }

  const updateModalFilter = <Key extends keyof SettlementHistoryFilter,>(
    key: Key,
    value: SettlementHistoryFilter[Key],
  ) => {
    setModalFilter((prev) => ({ ...prev, [key]: value }))
  }

  const handleRangeOptionChange = (value: PaymentHistoryRangeOption[] | null) => {
    const nextOption = value?.[0] ?? 'month'

    setModalFilter((prev) => ({
      ...prev,
      selectrangeOption: [nextOption],
      rangeDate: getRangeDateForOption(nextOption),
    }))
  }

  const handleApplyFilter = () => {
    currentPage.current = 0
    setFilter({ ...modalFilter })
    setOpenFilter(false)
  }

  const handleSortChange = (value: SettlementHistorySort) => {
    currentPage.current = 0
    setSort(value)
  }

  const handleRefresh = useCallback(() => {
    if (!currentParams || loadingRef.current) return

    currentPage.current = 0
    setSummaryReloadSignal((prev) => prev + 1)
    void loadSettlementList({ ...currentParams, page: 0 })
  }, [currentParams, loadSettlementList])

  const handleListScroll = (event: UIEvent<HTMLElement>) => {
    const target = event.currentTarget
    const distanceToBottom =
      target.scrollHeight - target.scrollTop - target.clientHeight
    const hasNextPage = settlementList.length < totalCount

    if (!currentParams || !hasNextPage || loadingRef.current) return
    if (distanceToBottom > 120) return

    void loadSettlementList(
      { ...currentParams, page: currentPage.current + 1 },
      { append: true },
    )
  }

  return {
    settlementPeriod,
    sort,
    currentParams,
    summaryReloadSignal,
    settlementList,
    listLoading,
    loadingMore,
    totalCount,
    openFilter,
    modalFilter,
    handleSortChange,
    handleRefresh,
    handleListScroll,
    openFilterModal,
    closeFilterModal: () => setOpenFilter(false),
    updateModalFilter,
    handleRangeOptionChange,
    handleApplyFilter,
  }
}
