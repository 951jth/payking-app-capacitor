import iconArrowRight from '../../assets/icons/Icon_arrow_right_16.svg'
import { FaqCollapseList } from '../../components/features/faq/FaqCollapseList'
import { PKText } from '../../components'
import { useAlertStore } from '../../stores/alertStore'

export function HomeFaqSection() {
  const showAlert = useAlertStore((state) => state.showAlert)

  return (
    <section className={classes.section}>
      <div className={classes.header}>
        <PKText as="h3" className={classes.title} weight={500}>
          자주 묻는 질문
        </PKText>
        <button
          className={classes.moreButton}
          onClick={() =>
            showAlert({
              title: '준비 중',
              contents: 'FAQ 전체 목록은 faqList activity 연결 후 열립니다.',
            })
          }
          type="button"
        >
          <PKText as="span" className={classes.moreText} weight={200}>
            더 보기
          </PKText>
          <img alt="" className={classes.moreIcon} src={iconArrowRight} />
        </button>
      </div>
      <FaqCollapseList />
    </section>
  )
}

const classes = {
  section: 'border-t border-[var(--pk-border)]',
  header:
    'flex items-center justify-between pb-4 pt-5',
  title: 'm-0 text-base text-[var(--pk-text)]',
  moreButton:
    '-m-2 flex items-center justify-center border-0 bg-transparent p-2',
  moreText:
    'text-xs text-[var(--pk-text)]',
  moreIcon:
    'block h-4 w-4',
}
