import { useEffect, useState } from 'react'
import type { ApiResponse } from '../../../service/axios'
import standardService from '../../../service/standard'
import { PKCollapseItem } from '../../collapse/PKCollapseItem'
import { PKText } from '../../typography/PKText'

export type FaqItem = {
  id: string | number
  title?: string
  content?: string
  faqCategory?: {
    name?: string
  }
}

type FaqListParams = {
  page?: number
  size?: number
  placementType?: string
  sort?: string
  [key: string]: unknown
}

type FaqCollapseListProps = {
  initialParams?: FaqListParams
  className?: string
  useFirstBorder?: boolean
  useLastBorder?: boolean
}

const defaultParams: FaqListParams = {
  page: 0,
  size: 5,
  placementType: 'HOME',
  sort: 'homeOrd,ASC',
}

function getApiData<T>(response: { data?: unknown }): T | null {
  const payload = response.data as ApiResponse<T> | undefined
  if (payload?.data !== undefined && payload?.data !== null) {
    return payload.data as T
  }

  return null
}

function sanitizeHtml(html?: string) {
  if (!html) return ''

  const template = document.createElement('template')
  template.innerHTML = html

  template.content
    .querySelectorAll('script, style, iframe, object, embed, link, meta')
    .forEach((node) => node.remove())

  template.content.querySelectorAll('*').forEach((element) => {
    Array.from(element.attributes).forEach((attribute) => {
      const name = attribute.name.toLowerCase()
      const value = attribute.value.trim().toLowerCase()

      if (
        name.startsWith('on') ||
        ((name === 'href' || name === 'src') && value.startsWith('javascript:'))
      ) {
        element.removeAttribute(attribute.name)
      }
    })
  })

  return template.innerHTML
}

function HtmlViewer({ html }: { html?: string }) {
  return (
    <div
      className={classes.htmlViewer}
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }}
    />
  )
}

export function FaqCollapseList({
  initialParams = defaultParams,
  className,
  useFirstBorder = true,
  useLastBorder = true,
}: FaqCollapseListProps) {
  const [activeKey, setActiveKey] = useState<string | number | null>(null)
  const [items, setItems] = useState<FaqItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let ignore = false

    void standardService
      .getFaqList({
        ...initialParams,
        page: initialParams.page ?? 0,
        size: initialParams.size ?? 20,
        isUsable: true,
        isDeleted: false,
      })
      .then((response) => {
        if (ignore) return

        const faqItems = getApiData<FaqItem[]>(response) ?? []
        setItems(faqItems)
      })
      .catch((error) => {
        if (!ignore) {
          console.warn('FAQ 목록 조회 실패:', error)
          setItems([])
        }
      })
      .finally(() => {
        if (!ignore) setLoading(false)
      })

    return () => {
      ignore = true
    }
  }, [initialParams])

  const handleToggle = (id: string | number) => {
    setActiveKey((current) => (current === id ? null : id))
  }

  if (loading && items.length === 0) {
    return (
      <div className={[classes.emptyBox, className].filter(Boolean).join(' ')}>
        <PKText className={classes.emptyText} weight={200}>
          불러오는 중입니다.
        </PKText>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className={[classes.emptyBox, className].filter(Boolean).join(' ')}>
        <PKText className={classes.emptyText} weight={200}>
          질문 내역이 없습니다.
        </PKText>
      </div>
    )
  }

  return (
    <div className={className}>
      {items.map((item, index) => {
        const title = `[${item.faqCategory?.name ?? ''}] ${item.title ?? ''}`
        const isFirst = index === 0
        const isLast = index === items.length - 1

        return (
          <PKCollapseItem
            className={[
              useFirstBorder && isFirst ? classes.firstBorder : '',
              useLastBorder && isLast ? classes.lastBorder : '',
            ].join(' ')}
            content={<HtmlViewer html={item.content} />}
            id={item.id}
            isExpanded={activeKey === item.id}
            key={item.id}
            onToggle={handleToggle}
            title={title}
          />
        )
      })}
    </div>
  )
}

const classes = {
  firstBorder: 'border-t border-t-[var(--pk-text)]',
  lastBorder: 'border-b border-b-[var(--pk-text)]',
  emptyBox: 'py-20',
  emptyText:
    'block text-center text-sm text-[var(--pk-text)]',
  htmlViewer:
    'px-4 py-4 font-[var(--pk-font-scd)] text-xs leading-6 text-[var(--pk-text)] [&_*]:max-w-full [&_a]:text-[var(--pk-primary)] [&_img]:h-auto',
}
