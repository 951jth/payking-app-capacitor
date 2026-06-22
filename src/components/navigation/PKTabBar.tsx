import type { ComponentType, ReactNode } from 'react'
import type { ActivityName } from '../../navigation/activityParams'
import { PKText } from '../typography/PKText'

export type PKTabItem = {
  name: string
  title?: string
  ariaLabel?: string
  icon: ReactNode
  activeIcon?: ReactNode
  navigate?: ActivityName | false
  component?: ComponentType
  useHeader?: boolean
  centerAction?: boolean
  disabled?: boolean
}

type PKTabBarProps = {
  items: PKTabItem[]
  activeName: string
  onChange: (name: string, item: PKTabItem) => void
}

export function PKTabBar({ items, activeName, onChange }: PKTabBarProps) {
  return (
    <nav aria-label="하단 탭" className={classes.bar}>
      {items.map((item) => {
        const active = item.name === activeName

        return (
          <button
            aria-current={active ? 'page' : undefined}
            aria-label={item.ariaLabel ?? item.title}
            className={[
              classes.item,
              item.centerAction && classes.itemCenter,
              active && classes.itemActive,
            ]
              .filter(Boolean)
              .join(' ')}
            disabled={item.disabled}
            key={item.name}
            onClick={() => onChange(item.name, item)}
            type="button"
          >
            <span className={classes.icon}>
              {active ? item.activeIcon ?? item.icon : item.icon}
            </span>
            {item.title && (
              <PKText className={classes.label} weight={active ? 500 : 200}>
                {item.title}
              </PKText>
            )}
          </button>
        )
      })}
    </nav>
  )
}

const classes = {
  bar:
    '-mt-0.5 flex h-[calc(80px+env(safe-area-inset-bottom))] items-start justify-around bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_12px_rgba(0,0,0,0.12)]',
  item:
    'inline-flex h-20 min-w-0 flex-1 cursor-pointer flex-col items-center justify-start gap-0.5 border-0 bg-transparent px-0 pb-0 pt-3 font-[inherit] text-[#99a2b0] [-webkit-tap-highlight-color:transparent]',
  itemActive: 'text-[var(--pk-text)]',
  itemCenter: 'overflow-visible',
  icon: 'inline-flex h-[34px] w-[34px] items-center justify-center overflow-visible',
  label: 'text-[10px] leading-[1.2] text-current',
}
