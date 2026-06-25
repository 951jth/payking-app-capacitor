import iconCash from "../assets/icons/Icon_cash.svg";
import iconCashActive from "../assets/icons/Icon_cash_active.svg";
import iconHamberger from "../assets/icons/Icon_hamberger.svg";
import iconHambergerActive from "../assets/icons/Icon_hamberger_active.svg";
import iconHome from "../assets/icons/Icon_home.svg";
import iconHomeActive from "../assets/icons/Icon_home_active.svg";
import iconPayment from "../assets/icons/Icon_payment.svg";
import iconPaymentActive from "../assets/icons/Icon_payment_active.svg";
import type { PKTabItem } from "../components";
import { QrCodeTabButton, TabIcon } from "../components/navigation/tabBarIcons";
import { HomeTabPanel } from "../tabs/HomeTabPanel";
import { MenuTabPanel } from "../tabs/MenuTabPanel";

export const mainTabScreens = [
  {
    name: "home",
    title: "홈",
    icon: <TabIcon src={iconHome} />,
    activeIcon: <TabIcon src={iconHomeActive} />,
    component: HomeTabPanel,
  },
  {
    name: "payHistory",
    title: "결제현황",
    icon: <TabIcon src={iconPayment} />,
    activeIcon: <TabIcon src={iconPaymentActive} />,
    navigate: "paymentHistory",
  },
  {
    name: "qrCode",
    ariaLabel: "톡결제",
    icon: <QrCodeTabButton />,
    navigate: "linkPayment",
    centerAction: true,
  },
  {
    name: "settleHistory",
    title: "정산현황",
    icon: <TabIcon src={iconCash} />,
    activeIcon: <TabIcon src={iconCashActive} />,
    navigate: "settlementHistory",
  },
  {
    name: "myPage",
    title: "메뉴",
    icon: <TabIcon src={iconHamberger} />,
    activeIcon: <TabIcon src={iconHambergerActive} />,
    component: MenuTabPanel,
    useHeader: true,
  },
] satisfies PKTabItem[];
