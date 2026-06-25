import homePaymentImage from '../../assets/images/Img_home_payment.svg'
import { pressableClassName } from '../../utils/pressable'
import { PKText } from '../typography/PKText'

type HomePaymentButtonProps = {
  onClick?: () => void
  disabled?: boolean
}

export function HomePaymentButton({ onClick, disabled = false }: HomePaymentButtonProps) {
  return (
    <button
      className={classes.button}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      <PKText as="span" className={classes.label} weight={600}>
        결제 받기
      </PKText>
      <img alt="" className={classes.image} src={homePaymentImage} />
    </button>
  )
}

const classes = {
  button: `@container flex h-full w-full flex-col items-center justify-between gap-6 overflow-hidden rounded-[10px] border-0 bg-[var(--pk-primary)] pt-6 disabled:cursor-default disabled:opacity-60 ${pressableClassName}`,
  label: 'text-[clamp(20px,10cqi,28px)] leading-[1.1] text-white',
  image: 'min-h-0 w-full flex-1 object-contain object-bottom',
}
