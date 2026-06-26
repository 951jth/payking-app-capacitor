import type {
  CardScanIssueBank,
  CardScanPaymentEvent,
  CardScanPaymentRequest,
} from "../../../types/cardScan";
import type {
  LinkPaymentGoods,
  LinkPaymentTaxDeductType,
  LinkPaymentTaxType,
} from "../../../types/linkPayment";
import {
  calculateTotalPrice,
  calculateTotalPriceByTaxType,
  selectGoodsTotalName,
} from "../../../utils/linkPayment";
import { removeEmpty } from "../../../utils/removeEmpty";
import type { CardScanPaymentFormState } from "../components/CardScanPaymentForm";

type CreateDirectGoodsParams = {
  name: string;
  price: number;
  taxType: LinkPaymentTaxType;
};

type CreateInitialFormStateParams = {
  selectedGoodsList?: LinkPaymentGoods[];
  enterPrice: number | string;
  agentRecord: Record<string, unknown> | null;
};

type CreateCardScanGoodsesParams = {
  selectedGoodsList?: LinkPaymentGoods[];
  enterPrice: number | string;
  formState: CardScanPaymentFormState;
};

type CreateKeyinPayRequestParams = {
  event: CardScanPaymentEvent;
  formState: CardScanPaymentFormState;
  issueBankList: CardScanIssueBank[];
  enterPrice: number | string;
  selectedGoodsList?: LinkPaymentGoods[];
};

function getStringProperty(
  source: Record<string, unknown> | null | undefined,
  key: string,
) {
  const value = source?.[key];
  return typeof value === "string" ? value : "";
}

function getDefaultTaxType(source: Record<string, unknown> | null | undefined) {
  return source?.taxType === "FREE" ? "FREE" : "TAX";
}

export function createDirectGoods({
  name,
  price,
  taxType,
}: CreateDirectGoodsParams): LinkPaymentGoods {
  return {
    ord: 0,
    count: 1,
    goodsType: "DIRECT",
    name,
    price,
    taxType,
  };
}

export const EMPTY_CARD_SCAN_FORM_STATE: CardScanPaymentFormState = {
  goodsName: "",
  taxType: "TAX",
  buyerPhoneNumber: "",
  taxDeductType: "NORMAL",
  selectedBankCode: "",
  selectedQuotaMonths: 0,
};

function createCardScanGoodses({
  selectedGoodsList,
  enterPrice,
  formState,
}: CreateCardScanGoodsesParams): LinkPaymentGoods[] {
  // 결제 요청 시점에만 formState를 단일 원천으로 삼아 직접결제 상품 payload를 만든다.
  if (selectedGoodsList?.length) return selectedGoodsList;

  return [
    createDirectGoods({
      name: formState.goodsName,
      price: Number(enterPrice) || 0,
      taxType: formState.taxType,
    }),
  ];
}

export function createInitialFormState({
  selectedGoodsList,
  enterPrice,
  agentRecord,
}: CreateInitialFormStateParams): CardScanPaymentFormState {
  // 화면 진입/params 변경 시 formState의 상품명·과세를 맞춘다.
  // 상품 선택 진입이면 첫 상품 기준, 금액 입력 진입이면 agent 기본값 + enterPrice 기준.
  const firstGoods = selectedGoodsList?.length
    ? selectedGoodsList[0]
    : createDirectGoods({
        name: getStringProperty(agentRecord, "defaultGoodsName"),
        price: Number(enterPrice) || 0,
        taxType: getDefaultTaxType(agentRecord),
      });

  return {
    ...EMPTY_CARD_SCAN_FORM_STATE,
    goodsName: firstGoods?.name ?? "",
    taxType: firstGoods?.taxType ?? "TAX",
  };
}

function createPaymentRequest({
  goodses,
  goodsName,
  totalPayAmount,
  issueBank,
  quotaMonths,
  buyerPhoneNumber,
  taxDeductType,
}: {
  goodses: LinkPaymentGoods[];
  goodsName: string;
  totalPayAmount: number;
  issueBank: CardScanIssueBank | null;
  quotaMonths: number;
  buyerPhoneNumber: string;
  taxDeductType: LinkPaymentTaxDeductType;
}): CardScanPaymentRequest {
  // 서버 key-in 결제 API가 기대하는 기본 결제 payload 형태다.
  // 카드번호/유효기간은 OCR 또는 직접입력 이벤트를 받은 뒤 아래 createKeyinPayRequest에서 채운다.
  return {
    payType: "DIRECT_PAY",
    payKind: "KEYIN_NE",
    payFunnel: "SCAN",
    goodsName,
    goodsCount: 1,
    goodsPrice: totalPayAmount,
    totalPayAmount,
    quotaMonths,
    goodses,
    buyerPhoneNumber,
    taxDeductType,
    payCardDto: {
      issueCode: issueBank?.code ?? null,
      issueName: issueBank?.name,
    },
  };
}

export function createKeyinPayRequest({
  event,
  formState,
  issueBankList,
  enterPrice,
  selectedGoodsList,
}: CreateKeyinPayRequestParams) {
  // 네이티브 OCR 화면은 카드 스캔/직접입력 결과만 이벤트로 올려준다.
  // 웹은 그 결과를 현재 폼/상품 상태와 합쳐 서버 key-in 결제 요청으로 변환해야 한다.
  const goodses = createCardScanGoodses({
    selectedGoodsList,
    enterPrice,
    formState,
  });
  const totalPayAmount = calculateTotalPrice(goodses);
  const [expireMonth = "", expireYear = ""] = event.expiry.split("/");
  const selectedBankCode =
    event.payFunnel === "INPUT"
      ? event.selectBankCode || formState.selectedBankCode
      : formState.selectedBankCode;
  const quotaMonths =
    event.payFunnel === "INPUT"
      ? Number(event.selectQuotaMonths) || 0
      : formState.selectedQuotaMonths;
  const selectedBank =
    issueBankList.find((bank) => bank.code === selectedBankCode) ?? null;
  const request = createPaymentRequest({
    goodses,
    goodsName: selectGoodsTotalName(goodses),
    totalPayAmount,
    issueBank: selectedBank,
    quotaMonths,
    buyerPhoneNumber: formState.buyerPhoneNumber,
    taxDeductType: formState.taxDeductType,
  });

  request.payFunnel = event.payFunnel;
  request.quotaMonths = quotaMonths;
  request.payCardDto = {
    ...request.payCardDto,
    issueCode: selectedBankCode,
    cardNumber: event.cardNumber,
    expireMonth,
    expireYear,
  };

  return removeEmpty({
    ...request,
    ...calculateTotalPriceByTaxType(goodses),
  });
}
