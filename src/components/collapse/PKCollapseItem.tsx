import type { ReactNode } from 'react'
import iconDown from '../../assets/icons/Icon_down_20.svg'
import { PKText } from '../typography/PKText'

type PKCollapseItemProps = {
  id: string | number
  title: ReactNode
  content: ReactNode
  isExpanded: boolean
  onToggle: (id: string | number) => void
  className?: string
}

export function PKCollapseItem({
  id,
  title,
  content,
  isExpanded,
  onToggle,
  className,
}: PKCollapseItemProps) {
  const panelId = `pk-collapse-panel-${id}`

  return (
    <div className={[classes.container, className].filter(Boolean).join(' ')}>
      <button
        aria-controls={panelId}
        aria-expanded={isExpanded}
        className={classes.header}
        onClick={() => onToggle(id)}
        type="button"
      >
        {typeof title === 'string' ? (
          <PKText
            as="span"
            className={[
              classes.title,
              isExpanded ? classes.titleExpanded : classes.titleCollapsed,
            ].join(' ')}
            weight={500}
          >
            {title}
          </PKText>
        ) : (
          title
        )}
        <span className={classes.status}>
          <img
            alt=""
            className={[
              classes.icon,
              isExpanded ? classes.iconExpanded : '',
            ].join(' ')}
            src={iconDown}
          />
        </span>
      </button>

      {isExpanded && (
        <div className={classes.details} id={panelId}>
          {content}
        </div>
      )}
    </div>
  )
}

const classes = {
  container: 'border-b border-[#eeeeee]',
  header:
    'flex min-h-[50px] w-full items-center justify-between gap-2 border-0 bg-white px-1 py-0 text-left',
  title:
    'min-w-0 flex-1 text-sm leading-[1.45] text-[var(--pk-text)]',
  titleCollapsed:
    'line-clamp-1',
  titleExpanded:
    'line-clamp-3',
  status:
    'flex shrink-0 items-center gap-1.5',
  icon:
    'block h-5 w-5 transition-transform duration-200',
  iconExpanded:
    'rotate-180',
  details:
    'bg-[#e7e9ee]',
}
