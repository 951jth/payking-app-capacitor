import { useEffect, useState } from "react";
import standardService from "../../../service/standard";
import { useAlertStore } from "../../../stores/alertStore";
import type { CardScanIssueBank } from "../../../types/cardScan";
import { installmentOptionPresets } from "../constants/cardScanPayment.constants";

function getApiData<T>(response: { data?: { data?: T } }) {
  return response.data?.data;
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;

  const maybeError = error as {
    response?: {
      data?: {
        meta?: {
          userMessage?: string;
          systemMessage?: string;
        };
      };
    };
  };

  return (
    maybeError?.response?.data?.meta?.userMessage ||
    maybeError?.response?.data?.meta?.systemMessage ||
    "서버 오류"
  );
}

function applyInterestFreeLabels(
  banks: CardScanIssueBank[],
  interestFrees: Record<string, unknown>[],
) {
  return banks.map((bank) => {
    const interestFree = interestFrees.find((free) => {
      const issueBank = free.issueBank as { code?: string } | undefined;
      return issueBank?.code === bank.code;
    });

    if (!interestFree) {
      return { ...bank, installmentMonths: installmentOptionPresets };
    }

    const months = Number(interestFree.months) || 0;
    const partials = Array.isArray(interestFree.partials)
      ? interestFree.partials
      : [];

    return {
      ...bank,
      installmentMonths: installmentOptionPresets.map((option) => {
        const value = Number(option.value) || 0;
        const hasPartial = partials.some((partial) => {
          const item = partial as { partialMonth?: number };
          return item.partialMonth === value;
        });

        if (value === 0) return option;
        if (months >= value) return { ...option, label: `${option.label} 무이자` };
        if (hasPartial) return { ...option, label: `${option.label} 부분 무이자` };
        return option;
      }),
    };
  });
}

export function useCardScanIssueBanks() {
  const showAlert = useAlertStore((state) => state.showAlert);
  const [issueBankList, setIssueBankList] = useState<CardScanIssueBank[]>([]);
  const [loadingBanks, setLoadingBanks] = useState(true);

  useEffect(() => {
    let ignore = false;

    async function loadIssueBanks() {
      setLoadingBanks(true);

      try {
        const [bankResponse, interestFreeResponse] = await Promise.all([
          standardService.getIssueBankList({ isUsable: true }),
          standardService.getInterestFree({ isUsable: true }),
        ]);

        if (ignore) return;

        const banks = getApiData<CardScanIssueBank[]>(bankResponse) ?? [];
        const interestFrees =
          getApiData<Record<string, unknown>[]>(interestFreeResponse) ?? [];

        setIssueBankList(applyInterestFreeLabels(banks, interestFrees));
      } catch (error) {
        if (!ignore) {
          showAlert({
            title: "카드사 조회 실패",
            contents: getErrorMessage(error),
          });
        }
      } finally {
        if (!ignore) setLoadingBanks(false);
      }
    }

    void loadIssueBanks();

    return () => {
      ignore = true;
    };
  }, [showAlert]);

  return {
    issueBankList,
    loadingBanks,
  };
}
