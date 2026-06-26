import { Capacitor, registerPlugin } from "@capacitor/core";
import type { PluginListenerHandle } from "@capacitor/core";
import type {
  CardScanOcrParams,
  CardScanPaymentEvent,
  CardScanPaymentResult,
} from "../types/cardScan";

export type PaykingOcrPaymentResult = CardScanPaymentResult;

export interface PaykingOcrPlugin {
  presentOCRView(params: CardScanOcrParams): Promise<void>;
  onPaymentsSuccess(data: PaykingOcrPaymentResult): Promise<void>;
  onPaymentsError(data: PaykingOcrPaymentResult): Promise<void>;
  addListener(
    eventName: "onPayment",
    listenerFunc: (event: CardScanPaymentEvent) => void,
  ): Promise<PluginListenerHandle>;
}

export const PaykingOcr = registerPlugin<PaykingOcrPlugin>("PaykingOcr");

export function isPaykingOcrAvailable() {
  return Capacitor.isNativePlatform();
}
