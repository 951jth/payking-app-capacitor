import paymentGif from '../../assets/gif/payment.gif'

export function TabIcon({ src }: { src: string }) {
  return <img alt="" className={classes.iconImage} draggable={false} src={src} />
}

export function QrCodeTabButton() {
  return (
    <span className={classes.qr}>
      <span className={classes.qrButton}>
        <img alt="" className={classes.qrGif} draggable={false} src={paymentGif} />
      </span>
      <span className={classes.qrLabel}>톡결제</span>
    </span>
  )
}

const classes = {
  iconImage: 'pointer-events-none block h-auto w-auto select-none object-none',
  qr: 'mb-[13px] inline-flex w-[60px] flex-col items-center justify-start gap-1',
  qrButton:
    'inline-flex h-[60px] w-[60px] items-center justify-center overflow-hidden rounded-full bg-[var(--pk-primary)]',
  qrGif:
    'pointer-events-none block h-[50px] w-[50px] select-none rounded-full object-cover',
  qrLabel:
    'font-[var(--pk-font-scd)] text-[10px] font-medium leading-[1.2] text-[var(--pk-primary)]',
}
