import type { ButtonHTMLAttributes } from 'react'
import iconArrowRight from '../../assets/icons/Icon_arrow_right_16.svg'
import { PKText } from '../typography/PKText'

type PKMoreButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  title: string
  iconSize?: 'sm' | 'lg'
}

export function PKMoreButton({
  title,
  className,
  iconSize = 'sm',
  type = 'button',
  ...props
}: PKMoreButtonProps) {
  return (
    <button
      className={[classes.button, className].filter(Boolean).join(' ')}
      type={type}
      {...props}
    >
      <PKText as="span" className={classes.label} weight={200}>
        {title}
      </PKText>
      <img
        alt=""
        className={iconSize === 'lg' ? classes.iconLg : classes.iconSm}
        src={iconArrowRight}
      />
    </button>
  )
}

const classes = {
  button:
    'flex cursor-pointer items-center justify-center gap-0 border-0 bg-transparent p-2 font-[var(--pk-font-scd)] touch-manipulation select-none disabled:cursor-default',
  label: 'text-xs text-[var(--pk-text)]',
  iconSm: 'block h-4 w-4',
  iconLg: 'block h-[21px] w-[21px]',
}
