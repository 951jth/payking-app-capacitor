import { LoaderCircle } from 'lucide-react'
import { PKText } from '../typography/PKText'

type ListPlaceholderProps = {
  message: string
  muted?: boolean
  compact?: boolean
}

export function ListPlaceholder({ message, muted, compact }: ListPlaceholderProps) {
  return (
    <div className={compact ? classes.loadingMore : classes.loadingBox}>
      <LoaderCircle className={classes.spinnerMuted} size={compact ? 18 : 24} />
      <PKText
        as="p"
        className={muted ? classes.empty : classes.loadingText}
        weight={200}
      >
        {message}
      </PKText>
    </div>
  )
}

const classes = {
  loadingBox: 'flex flex-col items-center justify-center gap-2 py-20',
  loadingText: 'm-0 text-center text-[14px] leading-[1.4] text-[#8b9099]',
  empty: 'm-0 py-20 text-center text-[14px] leading-[1.4] text-[#191919]',
  loadingMore: 'flex items-center justify-center gap-2 py-4',
  spinnerMuted: 'animate-spin text-[#8b9099]',
}
