import type { UIEvent } from 'react'
import { ListPlaceholder, SettlementItem } from '../components'
import type { SettlementListItem } from '../types/settlement'
import { SETTLEMENT_PAGE_SIZE } from '../utils/settlementHistory.constants'

export type SettlementHistoryListProps = {
  items: SettlementListItem[]
  listLoading: boolean
  loadingMore: boolean
  onItemClick: (item: SettlementListItem) => void
  onScroll: (event: UIEvent<HTMLElement>) => void
}

export function SettlementHistoryList({
  items,
  listLoading,
  loadingMore,
  onItemClick,
  onScroll,
}: SettlementHistoryListProps) {
  return (
    <section
      aria-busy={listLoading || loadingMore}
      aria-label="정산 내역"
      className={[
        classes.list,
        listLoading && items.length > 0 ? classes.listRefreshing : '',
      ]
        .filter(Boolean)
        .join(' ')}
      data-page-size={SETTLEMENT_PAGE_SIZE}
      onScroll={onScroll}
    >
      {listLoading && items.length === 0 ? (
        <ListPlaceholder message="불러오는 중입니다." />
      ) : items.length > 0 ? (
        items.map((item) => (
          <SettlementItem item={item} key={item.id} onClick={onItemClick} />
        ))
      ) : (
        <ListPlaceholder message="정산 내역이 없습니다." muted />
      )}
      {loadingMore ? <ListPlaceholder compact message="더 불러오는 중입니다." /> : null}
    </section>
  )
}

const classes = {
  list:
    'grid min-h-0 flex-1 content-start gap-2 overflow-y-auto pt-4 pb-[calc(104px+env(safe-area-inset-bottom))] [-webkit-overflow-scrolling:touch]',
  listRefreshing: 'pointer-events-none opacity-50',
}
