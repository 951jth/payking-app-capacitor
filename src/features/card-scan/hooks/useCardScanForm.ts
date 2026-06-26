import { useEffect, useMemo, useState } from "react";
import { useUserStore } from "../../../stores/userStore";
import type { LinkPaymentGoods } from "../../../types/linkPayment";
import { calculateTotalPrice } from "../../../utils/linkPayment";
import type { CardScanPaymentFormErrors } from "../components/CardScanPaymentForm";
import {
  createInitialFormState,
  EMPTY_CARD_SCAN_FORM_STATE,
} from "../utils/cardScanPaymentFactory";
import { hasCardScanSpecialCharacters } from "../utils/cardScanValidation";

type UseCardScanFormParams = {
  enterPrice: number | string;
  selectedGoodsList?: LinkPaymentGoods[];
};

export function useCardScanForm({
  enterPrice,
  selectedGoodsList,
}: UseCardScanFormParams) {
  const agent = useUserStore((state) => state.agent);
  const agentRecord = agent as Record<string, unknown> | null;
  const [formState, setFormState] = useState(EMPTY_CARD_SCAN_FORM_STATE);
  const isGoodsMode = Boolean(selectedGoodsList?.length);
  const totalPayAmount = useMemo(
    () =>
      selectedGoodsList?.length
        ? calculateTotalPrice(selectedGoodsList)
        : Number(enterPrice) || 0,
    [enterPrice, selectedGoodsList],
  );

  const formErrors = useMemo<CardScanPaymentFormErrors>(() => {
    const errors: CardScanPaymentFormErrors = {};

    if (
      formState.taxDeductType === "CULTURAL" &&
      formState.goodsName &&
      hasCardScanSpecialCharacters(formState.goodsName)
    ) {
      errors.goodsName =
        "문화비소득공제의 경우 상품명은 특수문자 포함 불가합니다.";
    }

    if (totalPayAmount >= 100000 && formState.buyerPhoneNumber.length > 0) {
      if (formState.buyerPhoneNumber.length < 11) {
        errors.buyerPhoneNumber = "휴대폰번호의 자리수가 올바르지 않습니다.";
      }
    }

    return errors;
  }, [
    formState.buyerPhoneNumber,
    formState.goodsName,
    formState.taxDeductType,
    totalPayAmount,
  ]);

  useEffect(() => {
    setFormState((prev) => ({
      ...createInitialFormState({
        selectedGoodsList,
        enterPrice,
        agentRecord,
      }),
      buyerPhoneNumber: prev.buyerPhoneNumber,
      taxDeductType: prev.taxDeductType,
      selectedBankCode: prev.selectedBankCode,
      selectedQuotaMonths: prev.selectedQuotaMonths,
    }));
  }, [agentRecord, enterPrice, selectedGoodsList]);

  return {
    formState,
    setFormState,
    formErrors,
    totalPayAmount,
    isGoodsMode,
  };
}
