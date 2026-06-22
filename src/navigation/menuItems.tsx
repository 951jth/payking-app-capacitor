import iconMenuCard from '../assets/icons/Icon_menu_card.svg'
import iconMenuChat from '../assets/icons/Icon_menu_chat.svg'
import iconMenuLink from '../assets/icons/Icon_menu_link.svg'
import iconMenuPhone from '../assets/icons/Icon_menu_phone.svg'
import iconMenuProduct from '../assets/icons/Icon_menu_product_mng.svg'
import iconMenuReceipt from '../assets/icons/Icon_menu_receipt.svg'
import iconMenuSearch from '../assets/icons/Icon_menu_search.svg'
import iconMenuSetting from '../assets/icons/Icon_menu_setting.svg'
import iconMenuUser from '../assets/icons/Icon_menu_user.svg'
export type MenuItem = {
  label: string
  icon: string
  activity?: string
}

export const menuItems: MenuItem[] = [
  { label: '결제링크 관리', icon: iconMenuLink, activity: 'linkList' },
  { label: '상품관리', icon: iconMenuProduct, activity: 'goodsList' },
  { label: '정기결제 관리', icon: iconMenuCard, activity: 'subscriptionList' },
  { label: '현금영수증', icon: iconMenuReceipt, activity: 'cashReceipt' },
  { label: '세금신고 자료조회', icon: iconMenuSearch, activity: 'searchData' },
  { label: '부계정', icon: iconMenuUser, activity: 'staffAccounts' },
  { label: '고객센터', icon: iconMenuPhone, activity: 'customerService' },
  { label: '기능 건의하기', icon: iconMenuChat, activity: 'featueSuggest' },
  { label: '설정', icon: iconMenuSetting, activity: 'setting' },
]
