import type { ReactNode } from 'react'
import iconArrowLeft from '../../assets/icons/Icon_arrow_left.svg'
import iconClose from '../../assets/icons/Icon_close_black_20.svg'
import { pressableClassName } from '../../utils/pressable'
import { PKText } from '../typography/PKText'

type AppHeaderProps = {
  title?: ReactNode
  onBack?: () => void
  onClose?: () => void
  right?: ReactNode
}

export function AppHeader({ title, onBack, onClose, right }: AppHeaderProps) {
  const showRightSpacer = Boolean(onBack && !right && !onClose)

  return (
    <header className={classes.header}>
      <div className={classes.side}>
        {onBack ? (
          <button
            aria-label="뒤로가기"
            className={classes.iconButton}
            onClick={onBack}
            type="button"
          >
            <img alt="" className={classes.backIcon} src={iconArrowLeft} />
          </button>
        ) : null}
      </div>

      <div className={classes.titleWrap}>
        {title ? (
          <PKText as="h1" className={classes.title} weight={500}>
            {title}
          </PKText>
        ) : null}
      </div>

      <div className={classes.side}>
        {right}
        {onClose ? (
          <button
            aria-label="닫기"
            className={classes.iconButton}
            onClick={onClose}
            type="button"
          >
            <img alt="" className={classes.closeIcon} src={iconClose} />
          </button>
        ) : showRightSpacer ? (
          <div aria-hidden className={classes.sideSpacer} />
        ) : null}
      </div>
    </header>
  )
}

const classes = {
  header: 'relative flex h-14 shrink-0 items-center bg-white',
  side: 'relative z-10 flex h-14 w-14 shrink-0 items-center justify-center [&_button]:cursor-pointer',
  sideSpacer: 'h-14 w-14 shrink-0',
  titleWrap:
    'pointer-events-none absolute inset-0 flex items-center justify-center px-14',
  title:
    'm-0 max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-center text-[16px] leading-[1.2] text-[#191919]',
  iconButton:
    `inline-flex h-14 w-14 items-center justify-center border-0 bg-transparent p-0 select-none disabled:cursor-default ${pressableClassName}`,
  backIcon: 'block h-4 w-[10px]',
  closeIcon: 'block h-5 w-5',
}
