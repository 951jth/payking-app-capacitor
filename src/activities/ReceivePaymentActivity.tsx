import type { ActivityComponentType } from "@stackflow/react";
import { useState } from "react";
import {
  AppContainer,
  AppHeader,
  PKTopTab,
  type PKTopTabItem,
} from "../components";
import { useAppNavigation } from "../navigation/useAppNavigation";
import { EnterAmountPanel } from "./receive-payment/EnterAmountPanel";
import { SelectProductPanel } from "./receive-payment/SelectProductPanel";

type ReceivePaymentTab = "enterAmount" | "selectProduct";

export const ReceivePaymentActivity: ActivityComponentType<
  "receivePayment"
> = () => {
  const navigation = useAppNavigation();
  const [activeTab, setActiveTab] =
    useState<ReceivePaymentTab>("enterAmount");

  const tabs: PKTopTabItem<ReceivePaymentTab>[] = [
    {
      name: "enterAmount",
      title: "금액 입력",
      content: <EnterAmountPanel />,
    },
    {
      name: "selectProduct",
      title: "상품 선택",
      content: <SelectProductPanel />,
    },
  ];

  return (
    <AppContainer
      className={classes.screen}
      contentClassName={classes.content}
      topChildren={
        <AppHeader onBack={navigation.goBack} title="결제받기" />
      }
    >
      <PKTopTab
        activeName={activeTab}
        ariaLabel="결제 금액 입력 방식"
        items={tabs}
        onChange={setActiveTab}
        panelClassName={classes.panel}
      />
    </AppContainer>
  );
};

const classes = {
  screen: "bg-white text-[var(--pk-text)]",
  content: "flex min-h-full flex-col bg-white",
  panel: "min-h-[320px] flex-1 px-5 py-5",
};
