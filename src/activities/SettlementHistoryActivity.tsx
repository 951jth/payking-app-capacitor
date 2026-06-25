import type { ActivityComponentType } from "@stackflow/react";
import { AppContainer, AppHeader } from "../components";
import { useAppNavigation } from "../navigation/useAppNavigation";
import type { SettlementListItem } from "../types/settlement";
import { SettlementCalendarHeaderButton } from "./SettlementCalendarHeaderButton";
import { SettlementHistoryFilterModal } from "./SettlementHistoryFilterModal";
import { SettlementHistoryList } from "./SettlementHistoryList";
import { SettlementHistorySummary } from "./SettlementHistorySummary";
import { SettlementSummarySheet } from "./SettlementSummarySheet";
import { useSettlementHistoryData } from "./useSettlementHistoryData";

export const SettlementHistoryActivity: ActivityComponentType<
  "settlementHistory"
> = () => {
  const navigation = useAppNavigation();
  const {
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
    closeFilterModal,
    updateModalFilter,
    handleRangeOptionChange,
    handleApplyFilter,
  } = useSettlementHistoryData();

  const handleItemClick = (item: SettlementListItem) => {
    if (!item.id) return;

    navigation.navigate("invoice", {
      id: item.id,
      from: "settlementHistory",
    });
  };

  return (
    <div className={activityClasses.root}>
      <AppContainer
        className={activityClasses.screen}
        contentClassName={activityClasses.content}
        useScrollView={false}
        topChildren={
          <AppHeader
            onBack={navigation.goBack}
            right={<SettlementCalendarHeaderButton />}
            title="정산 현황"
          />
        }
      >
        <SettlementHistorySummary
          listLoading={listLoading}
          loadingMore={loadingMore}
          onOpenFilter={openFilterModal}
          onRefresh={handleRefresh}
          onSortChange={handleSortChange}
          settlementPeriod={settlementPeriod}
          sort={sort}
          totalCount={totalCount}
        />

        <SettlementHistoryList
          items={settlementList}
          listLoading={listLoading}
          loadingMore={loadingMore}
          onItemClick={handleItemClick}
          onScroll={handleListScroll}
        />

        <SettlementHistoryFilterModal
          modalFilter={modalFilter}
          onApply={handleApplyFilter}
          onClose={closeFilterModal}
          onRangeOptionChange={handleRangeOptionChange}
          onUpdateFilter={updateModalFilter}
          visible={openFilter}
        />
      </AppContainer>

      <SettlementSummarySheet
        reloadSignal={summaryReloadSignal}
        searchParams={currentParams}
      />
    </div>
  );
};

const activityClasses = {
  root: "relative flex h-full min-h-0 flex-col overflow-hidden bg-white",
  screen: "min-h-0 flex-1 bg-white text-[var(--pk-text)]",
  content: "flex min-h-0 flex-1 flex-col bg-white px-5 pb-0 pt-[15px]",
};
