import { FaqCollapseList } from '../../features/faq/components/FaqCollapseList'
import { PKMoreButton, PKText } from '../../components'
import { useAlertStore } from '../../stores/alertStore'

export function HomeFaqSection() {
  const showAlert = useAlertStore((state) => state.showAlert)

  return (
    <section className={classes.section}>
      <div className={classes.header}>
        <PKText as="h3" className={classes.title} weight={500}>
          자주 묻는 질문
        </PKText>
        <PKMoreButton
          className="-m-2"
          onClick={() =>
            showAlert({
              title: '준비 중',
              contents: 'FAQ 전체 목록은 faqList activity 연결 후 열립니다.',
            })
          }
          title="더 보기"
        />
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
}
