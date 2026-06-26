import type { CardScanInstallmentMonth } from "../../../types/cardScan";
import type {
  LinkPaymentTaxDeductType,
  LinkPaymentTaxType,
} from "../../../types/linkPayment";

export const installmentOptionPresets: CardScanInstallmentMonth[] = [
  { label: "일시불", value: 0 },
  { label: "2개월", value: 2 },
  { label: "3개월", value: 3 },
  { label: "4개월", value: 4 },
  { label: "5개월", value: 5 },
  { label: "6개월", value: 6 },
  { label: "7개월", value: 7 },
  { label: "8개월", value: 8 },
  { label: "9개월", value: 9 },
  { label: "10개월", value: 10 },
  { label: "11개월", value: 11 },
  { label: "12개월", value: 12 },
];

export const taxTypeOptions = [
  { label: "과세", value: "TAX" },
  { label: "면세", value: "FREE" },
] satisfies { label: string; value: LinkPaymentTaxType }[];

export const taxDeductOptions = [
  { label: "적용", value: "CULTURAL" },
  { label: "적용 안함", value: "NORMAL" },
] satisfies { label: string; value: LinkPaymentTaxDeductType }[];

