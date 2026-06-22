import { ArrowLeft, X } from 'lucide-react'
import type { ReactNode } from 'react'
import { PKText } from '../typography/PKText'

type AppHeaderProps = {
  title?: ReactNode
  onBack?: () => void
  onClose?: () => void
  right?: ReactNode
}

export function AppHeader({ title, onBack, onClose, right }: AppHeaderProps) {
  return (
    <header className={classes.header}>
      <div className={classes.side}>
        {onBack && (
          <button
            aria-label="뒤로가기"
            className={classes.iconButton}
            onClick={onBack}
            type="button"
          >
            <ArrowLeft size={22} />
          </button>
        )}
      </div>
      <PKText as="h1" className={classes.title} weight={500}>
        {title}
      </PKText>
      <div className={classes.sideRight}>
        {right}
        {onClose && (
          <button
            aria-label="닫기"
            className={classes.iconButton}
            onClick={onClose}
            type="button"
          >
            <X size={22} />
          </button>
        )}
      </div>
    </header>
  )
}

const classes = {
  header:
    'grid h-14 grid-cols-[56px_1fr_56px] items-center border-b border-transparent bg-white',
  side: 'flex h-14 min-w-0 items-center',
  sideRight: 'flex h-14 min-w-0 items-center justify-end',
  iconButton:
    'inline-flex h-14 w-14 items-center justify-center border-0 bg-transparent text-black',
  title:
    'm-0 overflow-hidden text-ellipsis whitespace-nowrap text-center text-base text-[var(--pk-text)]',
}
