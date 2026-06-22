import iconBellOff from "../../assets/icons/Icon_bell_line_off.svg";
import iconBellOn from "../../assets/icons/Icon_bell_line_on.svg";
import iconCs from "../../assets/icons/Icon_cs.svg";
import iconSetting from "../../assets/icons/Icon_setting.svg";
import logoPayking from "../../assets/icons/Logo_payking_simple.svg";
import { PKIconButton } from "../../components";
import { useAlertStore } from "../../stores/alertStore";

const KAKAO_CS_URL = "https://pf.kakao.com/_xexhfxixj";

type HomeHeaderProps = {
  noticeUnreadCount: number;
};

export function HomeHeader({ noticeUnreadCount }: HomeHeaderProps) {
  const showAlert = useAlertStore((state) => state.showAlert);

  const openPlaceholder = (label: string) => {
    showAlert({
      title: "준비 중",
      contents: `${label} 화면은 홈 탭 이식 단계에서 연결합니다.`,
    });
  };

  return (
    <header className={classes.header}>
      <img alt="PayKing" className={classes.logo} src={logoPayking} />
      <div className={classes.actions}>
        <PKIconButton
          aria-label="알림"
          className={classes.iconButton}
          icon={
            <img
              alt=""
              className={classes.iconLarge}
              src={noticeUnreadCount > 0 ? iconBellOn : iconBellOff}
            />
          }
          onClick={() => openPlaceholder("알림")}
        />
        <PKIconButton
          aria-label="고객센터"
          className={classes.iconButton}
          icon={<img alt="" className={classes.iconLarge} src={iconCs} />}
          onClick={() => {
            window.open(KAKAO_CS_URL, "_blank", "noopener,noreferrer");
          }}
        />
        <PKIconButton
          aria-label="설정"
          className={classes.iconButton}
          icon={
            <img alt="" className={classes.iconSetting} src={iconSetting} />
          }
          onClick={() => openPlaceholder("설정")}
        />
      </div>
    </header>
  );
}

const classes = {
  header:
    "z-10 flex min-h-[60px] shrink-0 items-center justify-between bg-white px-5 pb-3 pt-0",
  logo: "block h-12 w-[30px] shrink-0 object-contain",
  actions: "flex h-12 items-center",
  iconButton: "h-9 w-9 shrink-0",
  iconLarge: "block h-9 w-9 object-contain",
  iconSetting: "block h-[21px] w-[21px] object-contain",
};
