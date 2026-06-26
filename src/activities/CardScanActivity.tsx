import type { ActivityComponentType } from "@stackflow/react";
import { useActivityParams } from "@stackflow/react";
import { LoaderCircle } from "lucide-react";
import { AppContainer, AppHeader, PKText } from "../components";
import { CardScanAmountSummary } from "../features/card-scan/components/CardScanAmountSummary";
import { CardScanPaymentForm } from "../features/card-scan/components/CardScanPaymentForm";
import { useCardScanForm } from "../features/card-scan/hooks/useCardScanForm";
import { useCardScanIssueBanks } from "../features/card-scan/hooks/useCardScanIssueBanks";
import { useCardScanOcrPayment } from "../features/card-scan/hooks/useCardScanOcrPayment";
import { useAppNavigation } from "../navigation/useAppNavigation";

export const CardScanActivity: ActivityComponentType<"cardScan"> = () => {
  const navigation = useAppNavigation();
  const params = useActivityParams<"cardScan">();
  const { issueBankList, loadingBanks } = useCardScanIssueBanks();
  const { formState, setFormState, formErrors, totalPayAmount, isGoodsMode } =
    useCardScanForm({
      enterPrice: params.enterPrice,
      selectedGoodsList: params.selectedGoodsList,
    });
  const { submitting, openOcr } = useCardScanOcrPayment({
    formState,
    formErrors,
    issueBankList,
    enterPrice: params.enterPrice,
    selectedGoodsList: params.selectedGoodsList,
    totalPayAmount,
    onSuccess: navigation.goBack,
  });

  return (
    <AppContainer
      className={classes.screen}
      contentClassName={classes.content}
      topChildren={
        <AppHeader onBack={navigation.goBack} title="카드 스캔 결제" />
      }
    >
      <CardScanAmountSummary amount={totalPayAmount} />

      <CardScanPaymentForm
        errors={formErrors}
        formState={formState}
        isGoodsMode={isGoodsMode}
        issueBankList={issueBankList}
        loadingBanks={loadingBanks}
        onSubmit={openOcr}
        setFormState={setFormState}
        submitting={submitting}
      />

      {loadingBanks && (
        <div className={classes.loading}>
          <LoaderCircle className={classes.spinner} size={22} />
          <PKText as="p" className={classes.loadingText}>
            카드사 정보를 불러오는 중입니다.
          </PKText>
        </div>
      )}
    </AppContainer>
  );
};

const classes = {
  screen: "bg-white text-[var(--pk-text)]",
  content: "grid content-start gap-6 bg-white px-6 py-[15px]",
  loading: "flex items-center justify-center gap-2 py-3",
  spinner: "animate-spin text-[#8b9099]",
  loadingText: "m-0 text-[13px] leading-[1.3] text-[#8b9099]",
};
