import { useState } from "react";
import {
  getPaymentMethodTitle,
  PaymentMethodGrid,
  PKCalculator,
} from "../../components";
import type { PaymentMethod } from "../../components";
import { useAppNavigation } from "../../navigation/useAppNavigation";
import { useAlertStore } from "../../stores/alertStore";

export function EnterAmountPanel() {
  const navigation = useAppNavigation();
  const showAlert = useAlertStore((state) => state.showAlert);
  const [enteredPrice, setEnteredPrice] = useState(0);

  const handlePaymentMethod = (method: PaymentMethod) => {
    if (method === "SAVED_LINK") {
      showAlert({
        title: "저장 링크 결제",
        contents: "저장 링크 목록 화면은 다음 단계에서 연결합니다.",
      });
      return;
    }

    if (enteredPrice < 1000) {
      showAlert({
        title: getPaymentMethodTitle(method),
        contents: "1,000원 부터 결제 가능합니다.",
      });
      return;
    }

    if (method === "CARD_SCAN") {
      showAlert({
        title: "카드 스캔 결제",
        contents:
          "카드 스캔 결제는 Capacitor 네이티브 플러그인 구현 후 연결합니다.",
      });
      return;
    }

    navigation.navigate("linkPayment", {
      enterPrice: enteredPrice,
    });
  };

  return (
    <div className={classes.panel}>
      <PKCalculator onChangeAmount={setEnteredPrice} />
      <PaymentMethodGrid onSelect={handlePaymentMethod} />
    </div>
  );
}

const classes = {
  panel: "grid gap-5",
};
