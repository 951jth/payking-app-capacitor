import iconCard from "../../../assets/icons/Icon_card_40.svg";
import iconKakao from "../../../assets/icons/Icon_kakao_40.svg";
import iconLink from "../../../assets/icons/Icon_link_40.svg";
import iconQr from "../../../assets/icons/Icon_qr_40.svg";
import { PKButton } from "../../../components/button/PKButton";
import { PKText } from "../../../components/typography/PKText";
import type { PaymentMethod } from "../utils/paymentMethod";

const paymentMethods = [
  {
    method: "CARD_SCAN",
    label: "카드 스캔 결제",
    icon: iconCard,
  },
  {
    method: "KAKAO_LINK",
    label: "카톡 링크 결제",
    icon: iconKakao,
  },
  {
    method: "QR",
    label: "QR 코드 결제",
    icon: iconQr,
  },
  {
    method: "SAVED_LINK",
    label: "저장 링크 결제",
    icon: iconLink,
  },
] satisfies {
  method: PaymentMethod;
  label: string;
  icon: string;
}[];

export function PaymentMethodGrid({
  onSelect,
}: {
  onSelect: (method: PaymentMethod) => void;
}) {
  return (
    <section aria-label="결제 방법" className={classes.paymentGrid}>
      {paymentMethods.map((item) => (
        <PKButton
          aria-label={item.label}
          className={classes.paymentButton}
          key={item.method}
          onPress={() => onSelect(item.method)}
          title={
            <span className={classes.paymentContent}>
              <img alt="" className={classes.paymentIcon} src={item.icon} />
              <PKText as="span" className={classes.paymentLabel}>
                {item.label}
              </PKText>
            </span>
          }
          type="custom"
        />
      ))}
    </section>
  );
}

const classes = {
  paymentGrid: "grid grid-cols-2 gap-2",
  paymentButton:
    "w-full min-w-0 rounded-2xl !border !border-solid !border-[#e7e9ee] !bg-white !px-3 !pb-4 !pt-[13px]",
  paymentContent: "flex w-full flex-col items-center justify-center gap-1",
  paymentIcon: "h-10 w-10 object-contain",
  paymentLabel: "text-[14px] leading-5 text-[#191919]",
};
