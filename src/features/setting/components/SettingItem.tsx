import type { ReactNode } from 'react'
import iconArrowRight from '../../../assets/icons/Icon_arrow_right_20.svg'
import { PKText } from '../../../components/typography/PKText'

type SettingItemProps = {
  title?: string
  icon?: ReactNode
  subTitle?: string
  postIcon?: ReactNode | null
  disabled?: boolean
  onPress?: () => void
}

export function SettingItem({
  title = '타이틀',
  icon,
  subTitle,
  postIcon = null,
  disabled = false,
  onPress,
}: SettingItemProps) {
  return (
    <div className={classes.root}>
      <button
        className={classes.button}
        disabled={disabled}
        onClick={onPress}
        type="button"
      >
        <span className={classes.main}>
          <span className={classes.iconWrap}>{icon}</span>
          <PKText as="span" className={classes.title} weight={500}>
            {title}
          </PKText>
        </span>
        {postIcon ?? (
          <img alt="" className={classes.arrow} src={iconArrowRight} />
        )}
      </button>
      {subTitle ? (
        <PKText as="p" className={classes.subTitle}>
          {subTitle}
        </PKText>
      ) : null}
    </div>
  )
}

const classes = {
  root: 'flex flex-col gap-2',
  button:
    'flex w-full items-center justify-between border-0 bg-transparent p-0 text-left disabled:cursor-default',
  main: 'flex min-w-0 items-center gap-2',
  iconWrap: 'flex h-9 w-9 shrink-0 items-center justify-center [&_img]:block [&_img]:h-9 [&_img]:w-9 [&_svg]:block [&_svg]:h-9 [&_svg]:w-9',
  title: 'text-base text-[var(--pk-text)]',
  arrow: 'block h-5 w-5 shrink-0',
  subTitle: 'm-0 text-xs leading-normal text-[#8B9099]',
}
