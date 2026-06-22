import iconArrowRight from '../assets/icons/Icon_arrow_right_20.svg'
import { PKText } from '../components'
import { menuItems } from '../navigation/menuItems'
import { useAlertStore } from '../stores/alertStore'

export function MenuTabPanel() {
  const showAlert = useAlertStore((state) => state.showAlert)

  return (
    <section className={classes.panel}>
      {menuItems.map((menu) => (
        <button
          className={classes.item}
          key={menu.label}
          onClick={() =>
            showAlert({
              title: '준비 중',
              contents: `${menu.label}(${menu.activity}) 화면은 메뉴 이식 단계에서 연결합니다.`,
            })
          }
          type="button"
        >
          <span className={classes.itemMain}>
            <img alt="" className={classes.itemIcon} src={menu.icon} />
            <PKText as="span" className={classes.itemLabel} weight={500}>
              {menu.label}
            </PKText>
          </span>
          <img alt="" className={classes.itemArrow} src={iconArrowRight} />
        </button>
      ))}
    </section>
  )
}

const classes = {
  panel: 'flex flex-col gap-6 bg-white px-6 pb-2 pt-[15px]',
  item:
    'flex w-full items-center justify-between border-0 bg-transparent p-0 text-left',
  itemMain: 'flex items-center gap-2',
  itemIcon: 'block h-9 w-9',
  itemLabel: 'text-base text-[var(--pk-text)]',
  itemArrow: 'block h-5 w-5',
}
