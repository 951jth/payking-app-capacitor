export type PaymentMethod = "CARD_SCAN" | "KAKAO_LINK" | "QR" | "SAVED_LINK";

export function getPaymentMethodTitle(method: PaymentMethod) {
  if (method === "CARD_SCAN") return "카드 스캔 결제";
  if (method === "KAKAO_LINK") return "카톡 링크 결제";
  if (method === "QR") return "QR 코드 결제";
  return "저장 링크 결제";
}
