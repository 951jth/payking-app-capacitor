import type {
  LinkPaymentGoods,
  LinkPaymentTaxDeductType,
} from "./linkPayment";

export type CardScanPayFunnel = "SCAN" | "INPUT";

export type CardScanInstallmentMonth = {
  value: number | string;
  label: string;
};

export type CardScanIssueBank = {
  code: string;
  name: string;
  imageUrl?: string | null;
  installmentMonths: CardScanInstallmentMonth[];
  isUsable?: boolean | number;
  ord?: number;
  [key: string]: unknown;
};

export type CardScanOcrParams = {
  issueBankList: CardScanIssueBank[];
  selectBankCode: string;
  selectQuotaMonths: string;
};

export type CardScanPaymentEvent = {
  payFunnel: CardScanPayFunnel;
  cardNumber: string;
  expiry: string;
  selectBankCode: string;
  selectQuotaMonths: string;
};

export type CardScanPaymentResult = {
  title: string;
  contents?: string;
  subContents?: string;
  selectIssueName?: string;
  checkIssueName?: string;
};

export type CardScanPaymentRequest = {
  payType: "DIRECT_PAY";
  payKind: "KEYIN_NE";
  payFunnel: CardScanPayFunnel;
  goodsName: string;
  goodsCount: number;
  goodsPrice: number;
  totalPayAmount: number;
  quotaMonths: number;
  goodses: LinkPaymentGoods[];
  buyerPhoneNumber: string;
  taxDeductType: LinkPaymentTaxDeductType;
  payCardDto: {
    issueCode: string | null;
    issueName?: string;
    cardNumber?: string;
    expireMonth?: string;
    expireYear?: string;
  };
};
