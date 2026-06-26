import iconInterestFee from '../../assets/icons/Icon_interest_fee.svg'
import iconLimitUpdate from '../../assets/icons/Icon_limit_update.svg'
import { HomePaymentButton } from '../../components'
import { useAppNavigation } from '../../navigation/useAppNavigation'
import { useAlertStore } from '../../stores/alertStore'

export function HomeActionCardsSection() {
  const navigation = useAppNavigation()
  const showAlert = useAlertStore((state) => state.showAlert)

  const openPlaceholder = (label: string) => {
    showAlert({
      title: '준비 중',
      contents: `${label} 화면은 홈 탭 이식 단계에서 연결합니다.`,
    })
  }

  return (
    <section className={classes.section}>
      <div className={classes.paymentCard}>
        <HomePaymentButton
          onClick={() => navigation.navigate('receivePayment', {})}
        />
      </div>

      <div className={classes.sideColumn}>
        <HomeOutlineActionButton
          icon={iconInterestFee}
          label="무이자 할부 안내"
          onClick={() => openPlaceholder('무이자 할부 안내')}
        />
        <HomeOutlineActionButton
          icon={iconLimitUpdate}
          label="한도상향 신청"
          onClick={() =>
            showAlert({
              title: '준비 중',
              contents: '한도상향 신청 API는 다음 단계에서 연결합니다.',
            })
          }
        />
      </div>
    </section>
  )
}

type HomeOutlineActionButtonProps = {
  icon: string
  label: string
  onClick: () => void
}

function HomeOutlineActionButton({ icon, label, onClick }: HomeOutlineActionButtonProps) {
  return (
    <button className={classes.outlineButton} onClick={onClick} type="button">
      <img alt="" className={classes.outlineIcon} src={icon} />
      <span className={classes.outlineLabel}>{label}</span>
    </button>
  )
}

const classes = {
  section: 'grid grid-cols-[minmax(0,194fr)_minmax(0,118fr)] items-stretch gap-2',
  paymentCard: 'relative aspect-[194/211] w-full min-h-0',
  sideColumn: 'grid h-full min-h-0 grid-rows-[minmax(0,1fr)_minmax(0,1fr)] gap-2',
  outlineButton:
    'box-border flex h-full min-h-0 w-full flex-col items-center justify-center gap-[15px] rounded-2xl border border-[var(--pk-border)] bg-white p-0 font-[var(--pk-font-scd)] text-xs font-normal text-[var(--pk-text)]',
  outlineIcon: 'aspect-[60/40] w-1/2 max-w-[60px] shrink-0 object-contain',
  outlineLabel: 'text-center text-xs leading-[1.2] text-[var(--pk-text)]',
}
