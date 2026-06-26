import type { Dispatch, SetStateAction } from "react";
import {
  PKButton,
  PKInput,
  PKRadioGroup,
  PKText,
} from "../../../components";
import type { CardScanIssueBank } from "../../../types/cardScan";
import type {
  LinkPaymentTaxDeductType,
  LinkPaymentTaxType,
} from "../../../types/linkPayment";
import { useUserStore } from "../../../stores/userStore";
import {
  installmentOptionPresets,
  taxDeductOptions,
  taxTypeOptions,
} from "../constants/cardScanPayment.constants";
import { CardScanPaymentSelectors } from "./CardScanPaymentSelectors";

type CardScanPaymentFormProps = {
  formState: CardScanPaymentFormState;
  setFormState: Dispatch<SetStateAction<CardScanPaymentFormState>>;
  errors: CardScanPaymentFormErrors;
  issueBankList: CardScanIssueBank[];
  isGoodsMode: boolean;
  loadingBanks: boolean;
  submitting: boolean;
  onSubmit: () => void;
};

export type CardScanPaymentFormState = {
  goodsName: string;
  taxType: LinkPaymentTaxType;
  buyerPhoneNumber: string;
  taxDeductType: LinkPaymentTaxDeductType;
  selectedBankCode: string;
  selectedQuotaMonths: number;
};

export type CardScanPaymentFormErrors = {
  goodsName?: string;
  selectedBankCode?: string;
  buyerPhoneNumber?: string;
};

export function CardScanPaymentForm({
  formState,
  setFormState,
  errors,
  issueBankList,
  isGoodsMode,
  loadingBanks,
  submitting,
  onSubmit,
}: CardScanPaymentFormProps) {
  const isCultTax = useUserStore((state) =>
    Boolean(state.agent?.submitDocs?.isCultTax),
  );
  const selectedBank =
    issueBankList.find((bank) => bank.code === formState.selectedBankCode) ??
    null;
  const installmentList =
    selectedBank?.installmentMonths ?? installmentOptionPresets;
  const selectedInstallment = installmentList.find(
    (option) => Number(option.value) === formState.selectedQuotaMonths,
  );

  const setField = <Key extends keyof CardScanPaymentFormState>(
    key: Key,
    value: CardScanPaymentFormState[Key],
  ) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
  };

  const changeGoodsName = (goodsName: string) => {
    setField("goodsName", goodsName);
  };

  const changeTaxType = (taxType: LinkPaymentTaxType) => {
    setField("taxType", taxType);
  };

  return (
    <section className={classes.form}>
      <div className={classes.field}>
        <PKText as="label" className={classes.label}>
          상품명
        </PKText>
        <PKInput
          disabled={isGoodsMode}
          maxLength={50}
          onChangeText={changeGoodsName}
          placeholder="상품명을 입력하세요."
          value={formState.goodsName}
        />
        {errors.goodsName && (
          <PKText as="p" className={classes.errorText}>
            {errors.goodsName}
          </PKText>
        )}
      </div>

      <CardScanPaymentSelectors
        installmentList={installmentList}
        issueBankList={issueBankList}
        onSelectBank={(bank) => {
          setFormState((prev) => ({
            ...prev,
            selectedBankCode: bank.code,
            selectedQuotaMonths: 0,
          }));
        }}
        onSelectInstallment={(installment) => {
          setField("selectedQuotaMonths", Number(installment.value) || 0);
        }}
        selectedBank={selectedBank}
        selectedInstallment={selectedInstallment}
      />

      <div className={classes.field}>
        <PKText as="label" className={classes.label}>
          과세/면세
        </PKText>
        <PKRadioGroup
          multiple={false}
          onChange={(value) => {
            changeTaxType((value?.[0] ?? "TAX") as LinkPaymentTaxType);
          }}
          options={taxTypeOptions}
          value={[formState.taxType]}
        />
      </div>

      <div className={classes.field}>
        <PKText as="label" className={classes.label}>
          휴대폰번호
        </PKText>
        <PKInput
          onChangeText={(buyerPhoneNumber) => {
            setField("buyerPhoneNumber", buyerPhoneNumber);
          }}
          placeholder="10만원 이상 결제 시 휴대폰번호 필수 입력"
          type="phoneNumber"
          value={formState.buyerPhoneNumber}
        />
        {errors.buyerPhoneNumber && (
          <PKText as="p" className={classes.errorText}>
            {errors.buyerPhoneNumber}
          </PKText>
        )}
      </div>

      {isCultTax && (
        <div className={classes.field}>
          <PKText as="label" className={classes.label}>
            문화비 소득공제
          </PKText>
          <PKRadioGroup
            multiple={false}
            onChange={(value) => {
              setField(
                "taxDeductType",
                (value?.[0] ?? "NORMAL") as LinkPaymentTaxDeductType,
              );
            }}
            options={taxDeductOptions}
            value={[formState.taxDeductType]}
          />
          <PKText as="p" className={classes.noticeText}>
            하나카드는 문화비소득공제 적용이 불가합니다.
          </PKText>
          <PKText as="p" className={classes.noticeText}>
            BC카드는 3개월 이하 할부만 문화비소득공제가 적용됩니다.
          </PKText>
        </div>
      )}

      <div className={classes.bottomAction}>
        <PKButton
          colorType="primary"
          disabled={loadingBanks || submitting}
          loading={submitting}
          onClick={onSubmit}
          title="카드 결제하기"
          type="standard"
        />
      </div>
    </section>
  );
}

const classes = {
  form: "grid gap-6",
  field: "grid gap-2",
  label: "m-0 pl-1 text-[14px] leading-5 text-[#575e6b]",
  errorText: "m-0 text-[12px] leading-[1.45] text-[#e22c17]",
  noticeText: "m-0 text-[12px] leading-[1.45] text-[#8b9099]",
  bottomAction:
    "sticky bottom-0 z-40 -mx-6 mt-2 bg-white px-6 pb-[calc(20px+env(safe-area-inset-bottom))] pt-4",
};
