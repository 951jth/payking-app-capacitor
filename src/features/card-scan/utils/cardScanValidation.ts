import type {
  CardScanPaymentFormErrors,
  CardScanPaymentFormState,
} from "../components/CardScanPaymentForm";

type CardScanValidationParams = {
  formState: CardScanPaymentFormState;
  formErrors: CardScanPaymentFormErrors;
  totalPayAmount: number;
};

export type CardScanValidationResult =
  | { ok: true }
  | {
      ok: false;
      title: string;
      contents: string;
    };

export function hasCardScanSpecialCharacters(value: string) {
  return /[^0-9A-Za-zㄱ-ㅎㅏ-ㅣ가-힣\s]/.test(value);
}

export function validateCardScanBeforeOcr({
  formState,
  formErrors,
  totalPayAmount,
}: CardScanValidationParams): CardScanValidationResult {
  if (!formState.goodsName.trim()) {
    return {
      ok: false,
      title: "상품명",
      contents: "상품명을 입력하세요.",
    };
  }

  if (formErrors.goodsName) {
    return {
      ok: false,
      title: "상품명",
      contents: formErrors.goodsName,
    };
  }

  if (!formState.selectedBankCode) {
    return {
      ok: false,
      title: "카드사 선택",
      contents: "카드사를 선택하세요.",
    };
  }

  if (totalPayAmount < 50000 && formState.selectedQuotaMonths > 0) {
    return {
      ok: false,
      title: "알림",
      contents: "결제 금액 5만원 이상부터 할부 사용 가능합니다.",
    };
  }

  if (
    formState.selectedBankCode === "03" &&
    formState.taxDeductType === "CULTURAL"
  ) {
    return {
      ok: false,
      title: "결제 불가",
      contents:
        "하나(외환)카드는 문화비소득공제가\n불가능한 카드사입니다.\n문화비소득공제를 적용하려면\n다른 카드로 결제하시거나\n미적용으로 결제해 주세요.",
    };
  }

  if (
    formState.selectedBankCode === "01" &&
    formState.selectedQuotaMonths > 3 &&
    formState.taxDeductType === "CULTURAL"
  ) {
    return {
      ok: false,
      title: "결제 불가",
      contents:
        "BC카드는 3개월 이하 할부만\n문화비소득공제가 적용됩니다.\n문화비소득공제를 적용하려면\n다른 카드로 결제하시거나\n미적용으로 결제해 주세요.",
    };
  }

  if (totalPayAmount >= 100000 && formState.buyerPhoneNumber.length < 11) {
    return {
      ok: false,
      title: "알림",
      contents:
        formState.buyerPhoneNumber.length === 0
          ? "10만원 이상 결제 시,\n휴대폰번호는 필수로 입력해야 합니다."
          : "휴대폰번호의 자리수가 올바르지 않습니다.",
    };
  }

  return { ok: true };
}

