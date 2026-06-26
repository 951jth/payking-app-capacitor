import { defineConfig } from "@stackflow/config";
import type { LinkPaymentGoods } from "../types/linkPayment";
import { activityDefinitions, initialActivity } from "./activityRegistry";

declare module "@stackflow/config" {
  interface Register {
    permission: Record<string, never>;
    login: Record<string, never>;
    findId: Record<string, never>;
    findPw: Record<string, never>;
    mainTab: Record<string, never>;
    paymentHistory: Record<string, never>;
    invoice: {
      id: string | number;
      from?: "settlementHistory";
    };
    cancelRequest: {
      id: string | number;
    };
    settlementHistory: Record<string, never>;
    receivePayment: Record<string, never>;
    linkPayment: {
      enterPrice?: number | string;
      selectedGoodsList?: LinkPaymentGoods[];
    };
    setting: Record<string, never>;
  }
}

export const stackflowConfig = defineConfig({
  activities: activityDefinitions.map(({ name }) => ({ name })),
  initialActivity: () => initialActivity,
  transitionDuration: 300,
});
