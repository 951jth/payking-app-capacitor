import { Capacitor, registerPlugin } from "@capacitor/core";
import type { PluginListenerHandle } from "@capacitor/core";
import type {
  CardScanOcrParams,
  CardScanPaymentEvent,
  CardScanPaymentResult,
} from "../types/cardScan";

export type PaykingOcrPaymentResult = CardScanPaymentResult;

/** 카드 OCR 네이티브 화면과 웹 결제 로직을 연결하는 Capacitor 플러그인 계약 */
export interface PaykingOcrPlugin {
  /** 네이티브 OCR/직접입력 화면을 연다. 카드사·할부 목록과 웹 폼 선택값을 초기값으로 전달한다. */
  presentOCRView(params: CardScanOcrParams): Promise<void>;
  /** 서버 결제 성공 후 네이티브 성공 다이얼로그(또는 화면 종료)를 처리한다. */
  onPaymentsSuccess(data: PaykingOcrPaymentResult): Promise<void>;
  /** 서버 결제 실패·카드사 불일치 등 오류를 네이티브 실패 다이얼로그로 표시한다. */
  onPaymentsError(data: PaykingOcrPaymentResult): Promise<void>;
  /** 네이티브에서 카드 스캔/직접입력이 완료되면 onPayment 이벤트로 카드 정보를 웹에 전달한다. */
  addListener(
    eventName: "onPayment",
    listenerFunc: (event: CardScanPaymentEvent) => void,
  ): Promise<PluginListenerHandle>;
}

/** @CapacitorPlugin(name = "PaykingOcr") 네이티브 구현과 연결되는 플러그인 인스턴스 */
export const PaykingOcr = registerPlugin<PaykingOcrPlugin>("PaykingOcr");

/** Android/iOS WebView에서만 OCR 플러그인 호출이 가능한지 확인한다. */
export function isPaykingOcrAvailable() {
  return Capacitor.isNativePlatform();
}
