import { PKText } from '../../components'
import { useAlertStore } from '../../stores/alertStore'
import type { AgentSettlementInfo, PaykingUser } from '../../stores/userStore'

type HomeGreetingSectionProps = {
  user: PaykingUser | null
  agentSettlementInfo: AgentSettlementInfo | null
}

export function HomeGreetingSection({
  user,
  agentSettlementInfo,
}: HomeGreetingSectionProps) {
  const showAlert = useAlertStore((state) => state.showAlert)
  const displayName = user?.name ? `${user.name}님` : '페이킹'
  const settlementPeriod = agentSettlementInfo?.settlementPeriod ?? 3

  return (
    <section className={classes.section}>
      <div className={classes.copy}>
        <PKText as="p" className={classes.greeting} weight={500}>
          안녕하세요,
        </PKText>
        <PKText as="p" className={classes.name} weight={600}>
          {displayName} 입니다:)
        </PKText>
      </div>

      <button
        className={classes.periodButton}
        onClick={() =>
          showAlert({
            title: '준비 중',
            contents: '정산주기 변경(PeriodButton)은 다음 단계에서 연결합니다.',
          })
        }
        type="button"
      >
        <PKText as="span" className={classes.periodLabel} weight={400}>
          정산주기
        </PKText>
        <PKText as="span" className={classes.periodValue} weight={600}>
          D+{settlementPeriod}
        </PKText>
      </button>
    </section>
  )
}

const classes = {
  section:
    'flex items-center justify-between border-b border-[var(--pk-border)] pb-[19px]',
  copy: 'grid gap-1',
  greeting: 'm-0 text-[20px] leading-[1.2] text-[#191919]',
  name: 'm-0 text-[24px] leading-[1.2] text-[#191919]',
  periodButton:
    'flex h-[60px] w-20 shrink-0 flex-col items-center justify-center gap-1 rounded-2xl border-0 bg-[var(--pk-border)]',
  periodLabel: 'text-[12px] leading-[1.2] text-[#191919]',
  periodValue: 'text-[20px] leading-[1.2] text-[#8b9099]',
}
