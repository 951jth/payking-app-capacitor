import type { ActivityComponentType } from "@stackflow/react";
import dayjs from "dayjs";
import { LoaderCircle, RefreshCcw } from "lucide-react";
import type { UIEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import iconFilter from "../assets/icons/Icon_filter.svg";
import type {
  PaymentListItem,
  PKRadioOption,
  PKSelectOption,
} from "../components";
import {
  AppContainer,
  AppHeader,
  BottomModal,
  PaymentItem,
  PKBottomWheelPicker,
  PKButton,
  PKIconButton,
  PKRadioGroup,
  PKRangeDatePicker,
  PKSearchInput,
  PKSelect,
  PKText,
} from "../components";
import { useAppNavigation } from "../navigation/useAppNavigation";
import payments from "../service/payments";
import { useAlertStore } from "../stores/alertStore";
import { addCommasToNumber } from "../utils/format";
import {
  formatDateRangeLabel,
  getApiPayload,
  getPaymentHistoryErrorMessage,
  getRangeDateForOption,
  type PaymentHistoryRangeOption,
} from "../utils/paymentHistory";
import { removeEmpty } from "../utils/removeEmpty";

type PaymentHistorySort = "statusDate,DESC" | "statusDate,ASC" | "price";

type PaymentHistoryFilter = {
  keyword: string;
  selectrangeOption: PaymentHistoryRangeOption[];
  selectedMonth: [number, number];
  rangeDate: string[];
  payStatuses: string[];
  cancelRequestStatus: string[];
  category: string[];
  payTypes: string[];
};

type FilterOption<Value extends string = string> = PKRadioOption<Value>;

type PaymentHistorySearchParams = {
  keyword?: string;
  payStatuses?: string | string[];
  cancelRequestStatus?: string;
  payTypes?: string;
  page?: number;
  size?: number;
  paySearchDateType?: "LAST_STATE";
  sort?: PaymentHistorySort | string[];
  fromDate?: string;
  toDate?: string;
  isInstallment?: boolean;
};

type StatusStatsItem = {
  totalAmount?: number;
};

const size = 20;

const sortOptions = [
  { label: "최신순", value: "statusDate,DESC" },
  { label: "과거순", value: "statusDate,ASC" },
  { label: "고액순", value: "price" },
] satisfies PKSelectOption<PaymentHistorySort>[];

const rangeOptions = [
  { label: "월별", value: "month" },
  { label: "1개월", value: "1month" },
  { label: "3개월", value: "3month" },
  { label: "직접 입력", value: "self" },
] satisfies FilterOption<PaymentHistoryRangeOption>[];

const monthOptions = Array.from({ length: 12 }, (_, index) => {
  const month = index + 1;
  return { label: `${month}월`, value: String(month) };
}) satisfies PKSelectOption<string>[];

const payStatusesOptions = [
  { label: "결제완료", value: "SUCCESS" },
  { label: "결제요청", value: "REQUEST" },
  { label: "결제취소", value: "CANCEL" },
  { label: "오류", value: "FAIL" },
] satisfies FilterOption[];

const cancelRequestStatusOptions = [
  { label: "결제취소 요청", value: "REQUEST" },
  { label: "결제취소 요청 완료", value: "COMPLETE" },
  { label: "결제취소 요청 취소", value: "CANCEL" },
] satisfies FilterOption[];

const categoryOptions = [
  { label: "일시불", value: "lumpSum" },
  { label: "할부", value: "installment" },
] satisfies FilterOption[];

const payTypesOptions = [
  { label: "링크결제/QR결제", value: "DIRECT_LINK" },
  { label: "저장링크결제", value: "SAVE_LINK" },
  { label: "정기결제", value: "RECURRING" },
  { label: "카드직접결제", value: "DIRECT_PAY" },
  { label: "현금결제", value: "CASH_PAY" },
] satisfies FilterOption[];

const initFilter: PaymentHistoryFilter = {
  keyword: "",
  selectrangeOption: ["month"],
  selectedMonth: [dayjs().year(), dayjs().month() + 1],
  rangeDate: [],
  payStatuses: [],
  cancelRequestStatus: [],
  category: [],
  payTypes: [],
};

function createYearOptions() {
  const currentYear = dayjs().year();

  return Array.from({ length: 4 }, (_, index) => {
    const year = currentYear - 3 + index;
    return { label: `${year}년`, value: String(year) };
  }) satisfies PKSelectOption<string>[];
}

function getDateRangeParams(filter: PaymentHistoryFilter) {
  if (filter.selectrangeOption.includes("month")) {
    const [year, month] = filter.selectedMonth;
    const currentMonth = dayjs()
      .year(year)
      .month(month - 1);

    return {
      fromDate: currentMonth.startOf("month").format("YYYYMMDD"),
      toDate: currentMonth.endOf("month").format("YYYYMMDD"),
    };
  }

  if (
    filter.rangeDate.length < 2 ||
    !filter.rangeDate[0] ||
    !filter.rangeDate[1]
  ) {
    return null;
  }

  return {
    fromDate: dayjs(filter.rangeDate[0]).format("YYYYMMDD"),
    toDate: dayjs(filter.rangeDate[1]).format("YYYYMMDD"),
  };
}

function getPaymentHistoryParams({
  filter,
  sort,
  page = 0,
}: {
  filter: PaymentHistoryFilter;
  sort: PaymentHistorySort;
  page?: number;
}) {
  let nextPayStatuses = [...filter.payStatuses];
  let nextCancelRequestStatus = [...filter.cancelRequestStatus];
  const dateParams = getDateRangeParams(filter);

  if (!dateParams) return null;

  if (nextPayStatuses.includes("REQUEST")) {
    nextPayStatuses = [...nextPayStatuses, "REQUEST_CAN", "REQUEST_EXP"];
  }

  if (nextPayStatuses.includes("CANCEL_REQ")) {
    nextPayStatuses = nextPayStatuses.filter(
      (status) => status !== "CANCEL_REQ",
    );
    nextCancelRequestStatus = ["CANCEL", "COMPLETE", "REQUEST"];
  }

  const params: PaymentHistorySearchParams = {
    keyword: filter.keyword,
    payStatuses: nextPayStatuses.toString(),
    cancelRequestStatus: nextCancelRequestStatus.toString(),
    payTypes: filter.payTypes.toString(),
    page,
    size,
    paySearchDateType: "LAST_STATE",
    sort: sort === "price" ? ["totalPayAmount,DESC", "statusDate,DESC"] : sort,
    ...dateParams,
  };

  const hasLumpSum = filter.category.includes("lumpSum");
  const hasInstallment = filter.category.includes("installment");

  if (!hasLumpSum && hasInstallment) params.isInstallment = true;
  if (hasLumpSum && !hasInstallment) params.isInstallment = false;

  return removeEmpty(params);
}

export const PaymentHistoryActivity: ActivityComponentType<
  "paymentHistory"
> = () => {
  const navigation = useAppNavigation();
  const [filter, setFilter] = useState<PaymentHistoryFilter>({ ...initFilter });
  const [modalFilter, setModalFilter] = useState<PaymentHistoryFilter>({
    ...initFilter,
  });
  const [sort, setSort] = useState<PaymentHistorySort>("statusDate,DESC");
  const [totalPayAmount, setTotalPayAmount] = useState(0);
  const [paymentList, setPaymentList] = useState<PaymentListItem[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [statsLoading, setStatsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [openFilter, setOpenFilter] = useState(false);
  const showAlert = useAlertStore((state) => state.showAlert);
  const currentPage = useRef(0);
  const loadingRef = useRef(false);
  const yearOptions = useMemo(() => createYearOptions(), []);
  const yearWheelOptions = useMemo(
    () =>
      yearOptions.map((option) => ({
        label: option.label,
        value: Number(option.value),
      })),
    [yearOptions],
  );
  const monthWheelOptions = useMemo(
    () =>
      monthOptions.map((option) => ({
        label: option.label,
        value: Number(option.value),
      })),
    [],
  );

  const currentParams = useMemo(
    () => getPaymentHistoryParams({ filter, sort, page: 0 }),
    [filter, sort],
  );
  const dateRange = useMemo(() => {
    return formatDateRangeLabel(currentParams);
  }, [currentParams]);

  const loadPaymentList = useCallback(
    async (
      params: PaymentHistorySearchParams | null,
      options: { append?: boolean } = {},
    ) => {
      if (!params || loadingRef.current) return;

      loadingRef.current = true;
      if (options.append) {
        setLoadingMore(true);
      } else {
        setListLoading(true);
      }

      try {
        const response = await payments.getMyPaymentSearch(params);
        const payload = getApiPayload<PaymentListItem[]>(response);
        const list = Array.isArray(payload.data) ? payload.data : [];

        setPaymentList((prev) => (options.append ? [...prev, ...list] : list));
        setTotalCount(Number(payload.meta?.totalCount ?? list.length));
        currentPage.current = Number(params.page ?? 0);
      } catch (error) {
        showAlert({
          title: "결제 현황",
          contents: getPaymentHistoryErrorMessage(error),
        });
      } finally {
        loadingRef.current = false;
        if (options.append) {
          setLoadingMore(false);
        } else {
          setListLoading(false);
        }
      }
    },
    [showAlert],
  );

  const loadStatusStats = useCallback(
    async (params: PaymentHistorySearchParams | null) => {
      if (!params?.fromDate || !params?.toDate) {
        setStatsLoading(false);
        return;
      }

      setStatsLoading(true);

      try {
        const response = await payments.getMyStatusStats(
          removeEmpty({
            fromDate: params.fromDate,
            toDate: params.toDate,
            paySearchDateType: params.paySearchDateType,
            payStatuses: ["SUCCESS"],
          }),
        );
        const payload = getApiPayload<StatusStatsItem[]>(response);
        const totalAmount = Array.isArray(payload.data)
          ? payload.data.reduce(
              (acc, item) => acc + Number(item.totalAmount ?? 0),
              0,
            )
          : 0;

        setTotalPayAmount(totalAmount);
      } catch (error) {
        showAlert({
          title: "결제 현황",
          contents: getPaymentHistoryErrorMessage(error),
        });
      } finally {
        setStatsLoading(false);
      }
    },
    [showAlert],
  );

  useEffect(() => {
    void loadPaymentList(currentParams);
    void loadStatusStats(currentParams);
  }, [currentParams, loadPaymentList, loadStatusStats]);

  const updateModalFilter = <Key extends keyof PaymentHistoryFilter>(
    key: Key,
    value: PaymentHistoryFilter[Key],
  ) => {
    setModalFilter((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleRangeOptionChange = (
    value: PaymentHistoryRangeOption[] | null,
  ) => {
    const nextOption = value?.[0] ?? "month";

    setModalFilter((prev) => ({
      ...prev,
      selectrangeOption: [nextOption],
      rangeDate: getRangeDateForOption(nextOption),
    }));
  };

  const handleApplyFilter = () => {
    currentPage.current = 0;
    setFilter({ ...modalFilter });
    setOpenFilter(false);
  };

  const handleRefresh = useCallback(() => {
    if (!currentParams || loadingRef.current) return;

    const refreshParams = {
      ...currentParams,
      page: 0,
    };

    currentPage.current = 0;
    void loadPaymentList(refreshParams);
    void loadStatusStats(refreshParams);
  }, [currentParams, loadPaymentList, loadStatusStats]);

  const openFilterModal = () => {
    setModalFilter({ ...filter });
    setOpenFilter(true);
  };

  useEffect(() => {
    const handlePaymentHistoryRefresh = () => {
      handleRefresh();
    };

    window.addEventListener(
      "payking:payment-history-refresh",
      handlePaymentHistoryRefresh,
    );

    return () => {
      window.removeEventListener(
        "payking:payment-history-refresh",
        handlePaymentHistoryRefresh,
      );
    };
  }, [handleRefresh]);

  const handleListScroll = (event: UIEvent<HTMLElement>) => {
    const target = event.currentTarget;
    const distanceToBottom =
      target.scrollHeight - target.scrollTop - target.clientHeight;
    const hasNextPage = paymentList.length < totalCount;

    if (!currentParams || !hasNextPage || loadingRef.current) return;
    if (distanceToBottom > 120) return;

    const nextParams = {
      ...currentParams,
      page: currentPage.current + 1,
    };

    void loadPaymentList(nextParams, { append: true });
  };

  return (
    <AppContainer
      className={classes.screen}
      contentClassName={classes.content}
      useScrollView={false}
      topChildren={<AppHeader onBack={navigation.goBack} title="결제 현황" />}
    >
      <section className={classes.summary}>
        <PKText as="p" className={classes.dateRange} weight={200}>
          {dateRange}
        </PKText>
        {statsLoading ? (
          <div aria-hidden className={classes.totalAmountLoading}>
            <LoaderCircle className={classes.spinnerPrimary} size={28} />
          </div>
        ) : (
          <PKText as="p" className={classes.totalAmount} weight={600}>
            {addCommasToNumber(totalPayAmount)}원
          </PKText>
        )}
        <div className={classes.toolbar}>
          <PKText as="p" className={classes.totalCount} weight={400}>
            총 {totalCount}건
          </PKText>
          <div className={classes.toolbarActions}>
            <PKSelect
              onChange={(value) => {
                currentPage.current = 0;
                setSort(value);
              }}
              options={sortOptions}
              value={sort}
            />
            <PKIconButton
              aria-label="결제 내역 새로고침"
              disabled={listLoading || loadingMore}
              icon={
                <RefreshCcw
                  className={listLoading ? classes.refreshIconLoading : ""}
                  size={18}
                />
              }
              onClick={handleRefresh}
            />
            <PKIconButton
              aria-label="필터 검색"
              icon={
                <img alt="" className={classes.filterIcon} src={iconFilter} />
              }
              onClick={openFilterModal}
            />
          </div>
        </div>
      </section>

      <section
        aria-busy={listLoading || loadingMore}
        aria-label="결제 내역"
        className={[
          classes.list,
          listLoading && paymentList.length > 0 ? classes.listRefreshing : "",
        ]
          .filter(Boolean)
          .join(" ")}
        data-page-size={size}
        data-search-params={JSON.stringify(currentParams)}
        onScroll={handleListScroll}
      >
        {listLoading && paymentList.length === 0 ? (
          <div className={classes.loadingBox}>
            <LoaderCircle className={classes.spinnerMuted} size={24} />
            <PKText as="p" className={classes.loadingText} weight={200}>
              불러오는 중입니다.
            </PKText>
          </div>
        ) : paymentList.length > 0 ? (
          paymentList.map((item) => (
            <PaymentItem
              item={item}
              key={item.id}
              onClick={(payment) => {
                if (!payment.id) return;
                navigation.navigate("invoice", { id: payment.id });
              }}
            />
          ))
        ) : (
          <PKText as="p" className={classes.empty} weight={200}>
            결제 내역이 없습니다.
          </PKText>
        )}
        {loadingMore && (
          <div className={classes.loadingMore}>
            <LoaderCircle className={classes.spinnerMuted} size={18} />
            <PKText as="p" className={classes.loadingText} weight={200}>
              더 불러오는 중입니다.
            </PKText>
          </div>
        )}
      </section>

      <BottomModal
        useScrollView={false}
        title="필터 검색"
        visible={openFilter}
        onClose={() => setOpenFilter(false)}
      >
        <div className={classes.filterSheet}>
          <div className={classes.filterScroll}>
            <PKSearchInput
              onChangeText={(value) => updateModalFilter("keyword", value)}
              placeholder="휴대폰번호, 상품명, 금액"
              value={modalFilter.keyword}
            />

            <div className={classes.filterSection}>
              <PKText as="p" className={classes.filterLabel} weight={200}>
                이용 기간
              </PKText>
              <PKRadioGroup
                multiple={false}
                onChange={handleRangeOptionChange}
                options={rangeOptions}
                value={modalFilter.selectrangeOption}
              />

              {modalFilter.selectrangeOption.includes("month") ? (
                <PKBottomWheelPicker
                  onChange={(value) =>
                    updateModalFilter(
                      "selectedMonth",
                      value as PaymentHistoryFilter["selectedMonth"],
                    )
                  }
                  options={[yearWheelOptions, monthWheelOptions]}
                  pickerTitle="월 선택"
                  placeholder="월을 선택해주세요."
                  value={modalFilter.selectedMonth}
                />
              ) : (
                <PKRangeDatePicker
                  disabled={
                    modalFilter.selectrangeOption.includes("1month") ||
                    modalFilter.selectrangeOption.includes("3month")
                  }
                  format="YY/M/D"
                  onChange={(value) => updateModalFilter("rangeDate", value)}
                  placeholder="연도/월/일"
                  value={modalFilter.rangeDate}
                />
              )}
            </div>

            <div className={classes.filterSection}>
              <PKText as="p" className={classes.filterLabel} weight={200}>
                결제 상태
              </PKText>
              <PKRadioGroup
                onChange={(value) =>
                  updateModalFilter("payStatuses", value ?? [])
                }
                options={payStatusesOptions}
                value={modalFilter.payStatuses}
              />
            </div>

            <div className={classes.filterSection}>
              <PKText as="p" className={classes.filterLabel} weight={200}>
                취소 요청 상태
              </PKText>
              <PKRadioGroup
                onChange={(value) =>
                  updateModalFilter("cancelRequestStatus", value ?? [])
                }
                options={cancelRequestStatusOptions}
                value={modalFilter.cancelRequestStatus}
              />
            </div>

            <div className={classes.filterSection}>
              <PKText as="p" className={classes.filterLabel} weight={200}>
                이용 구분
              </PKText>
              <PKRadioGroup
                onChange={(value) => updateModalFilter("category", value ?? [])}
                options={categoryOptions}
                value={modalFilter.category}
              />
            </div>

            <div className={classes.filterSection}>
              <PKText as="p" className={classes.filterLabel} weight={200}>
                결제 구분
              </PKText>
              <PKRadioGroup
                onChange={(value) => updateModalFilter("payTypes", value ?? [])}
                options={payTypesOptions}
                value={modalFilter.payTypes}
              />
            </div>
          </div>

          <div className={classes.filterActions}>
            <PKButton
              type="standard"
              colorType="solid-primary"
              onClick={handleApplyFilter}
              title="적용"
            />
          </div>
        </div>
      </BottomModal>
    </AppContainer>
  );
};

const classes = {
  screen: "bg-white text-[var(--pk-text)]",
  content: "flex min-h-0 flex-1 flex-col bg-white px-5 pb-0 pt-[15px]",
  summary:
    "mx-0 shrink-0 border-0 border-b border-solid border-b-[#1e1e1e] px-1",
  dateRange: "m-0 pb-2 text-[14px] leading-[1.2] text-[#191919]",
  totalAmount:
    "m-0 pb-4 text-[32px] leading-[1.18] tracking-normal text-[#191919]",
  totalAmountLoading:
    "flex h-[38px] items-center pb-4 text-[var(--pk-primary)]",
  spinnerPrimary: "animate-spin",
  spinnerMuted: "animate-spin text-[#8b9099]",
  toolbar: "flex flex-wrap items-center justify-between gap-2 pb-0.5",
  totalCount: "m-0 shrink-0 text-[14px] leading-[1.2] text-[#191919]",
  toolbarActions:
    "ml-auto flex min-w-0 shrink-0 items-center justify-center gap-0",
  refreshIconLoading: "animate-spin",
  filterIcon: "h-5 w-5",
  list: "grid min-h-0 flex-1 content-start gap-2 overflow-y-auto pt-4 pb-[env(safe-area-inset-bottom)] [-webkit-overflow-scrolling:touch]",
  listRefreshing: "pointer-events-none opacity-50",
  loadingBox: "flex flex-col items-center justify-center gap-2 py-20",
  loadingText: "m-0 text-center text-[14px] leading-[1.4] text-[#8b9099]",
  empty: "m-0 py-20 text-center text-[14px] leading-[1.4] text-[#191919]",
  loadingMore: "flex items-center justify-center gap-2 py-4",
  filterSheet: "flex max-h-[calc(100svh-132px)] min-h-0 flex-col",
  filterScroll:
    "grid min-h-0 flex-1 gap-4 overflow-y-auto px-5 pb-4 pt-3 [-webkit-overflow-scrolling:touch]",
  filterActions:
    "shrink-0 border-t border-[#eef1f5] bg-white px-5 pb-[calc(16px+env(safe-area-inset-bottom))] pt-3",
  filterSection: "grid gap-2",
  filterLabel: "m-0 text-[14px] leading-[1.2] text-[#191919]",
};
