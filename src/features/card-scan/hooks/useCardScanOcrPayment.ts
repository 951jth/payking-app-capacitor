import { useCallback, useEffect, useState } from "react";
import { PaykingOcr, isPaykingOcrAvailable } from "../../../plugins/paykingOcr";
import paymentsService from "../../../service/payments";
import { useAlertStore } from "../../../stores/alertStore";
import type {
  CardScanIssueBank,
  CardScanPaymentEvent,
} from "../../../types/cardScan";
import type { LinkPaymentGoods } from "../../../types/linkPayment";
import type {
  CardScanPaymentFormErrors,
  CardScanPaymentFormState,
} from "../components/CardScanPaymentForm";
import { getCardScanErrorMessage } from "../utils/cardScanErrors";
import { createKeyinPayRequest } from "../utils/cardScanPaymentFactory";
import { validateCardScanBeforeOcr } from "../utils/cardScanValidation";

type UseCardScanOcrPaymentParams = {
  formState: CardScanPaymentFormState;
  formErrors: CardScanPaymentFormErrors;
  issueBankList: CardScanIssueBank[];
  enterPrice: number | string;
  selectedGoodsList?: LinkPaymentGoods[];
  totalPayAmount: number;
  onSuccess: () => void;
};

export function useCardScanOcrPayment({
  formState,
  formErrors,
  issueBankList,
  enterPrice,
  selectedGoodsList,
  totalPayAmount,
  onSuccess,
}: UseCardScanOcrPaymentParams) {
  const showAlert = useAlertStore((state) => state.showAlert);
  const [submitting, setSubmitting] = useState(false);

  const openOcr = useCallback(async () => {
    const validation = validateCardScanBeforeOcr({
      formState,
      formErrors,
      totalPayAmount,
    });

    if (!validation.ok) {
      showAlert({
        title: validation.title,
        contents: validation.contents,
      });
      return;
    }

    if (!isPaykingOcrAvailable()) {
      showAlert({
        title: "카드 스캔 결제",
        contents: "카드 OCR 네이티브 플러그인 구현 후 실행할 수 있습니다.",
      });
      return;
    }

    try {
      await PaykingOcr.presentOCRView({
        issueBankList,
        selectBankCode: formState.selectedBankCode,
        selectQuotaMonths: String(formState.selectedQuotaMonths),
      });
    } catch (error) {
      showAlert({
        title: "카드 스캔 결제",
        contents: getCardScanErrorMessage(error),
      });
    }
  }, [formErrors, formState, issueBankList, showAlert, totalPayAmount]);

  const requestKeyinPay = useCallback(
    async (event: CardScanPaymentEvent) => {
      const request = createKeyinPayRequest({
        event,
        formState,
        issueBankList,
        enterPrice,
        selectedGoodsList,
      });

      setSubmitting(true);

      try {
        const response = await paymentsService.requestKeyinPay(request);
        const result = response.data?.data as
          | {
              resultCode?: string;
              failReason?: string;
              selectIssueName?: string;
              checkIssueName?: string;
            }
          | undefined;

        if (result?.resultCode === "SUCCESS") {
          await PaykingOcr.onPaymentsSuccess({
            title: "결제 성공",
            contents: "결제에 성공했습니다.",
          });
          showAlert({
            title: "결제 성공",
            contents: "결제에 성공했습니다.",
            onConfirm: onSuccess,
          });
          return;
        }

        if (
          result?.selectIssueName &&
          result?.checkIssueName &&
          result.selectIssueName !== result.checkIssueName
        ) {
          await PaykingOcr.onPaymentsError({
            title: "카드사 불일치",
            selectIssueName: result.selectIssueName,
            checkIssueName: result.checkIssueName,
          });
          return;
        }

        await PaykingOcr.onPaymentsError({
          title: "결제 불가",
          contents: result?.failReason || "결제 실패",
        });
      } catch (error) {
        await PaykingOcr.onPaymentsError({
          title: "결제 불가",
          contents: getCardScanErrorMessage(error),
        });
      } finally {
        setSubmitting(false);
      }
    },
    [
      enterPrice,
      formState,
      issueBankList,
      onSuccess,
      selectedGoodsList,
      showAlert,
    ],
  );

  useEffect(() => {
    const listener = PaykingOcr.addListener("onPayment", (payload) => {
      void requestKeyinPay(payload);
    });

    return () => {
      void listener.then((handle) => handle.remove());
    };
  }, [requestKeyinPay]);

  return {
    submitting,
    openOcr,
  };
}
