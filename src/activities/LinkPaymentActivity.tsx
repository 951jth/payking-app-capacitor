import type { ActivityComponentType } from "@stackflow/react";
import { useActivityParams } from "@stackflow/react";
import { CircleHelp, Minus, Plus, X } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import iconRequire from "../assets/icons/Icon_require.svg";
import {
  AppContainer,
  AppHeader,
  PKButton,
  PKInput,
  PKRadioGroup,
  PKText,
  SendLinkModal,
} from "../components";
import { useAppNavigation } from "../navigation/useAppNavigation";
import { useAlertStore } from "../stores/alertStore";
import { useUserStore } from "../stores/userStore";
import type {
  LinkPaymentEntryMode,
  LinkPaymentGoods,
  LinkPaymentTaxDeductType,
  LinkPaymentTaxType,
} from "../types/linkPayment";
import { addCommasToNumber } from "../utils/format";
import { calculateTotalPrice } from "../utils/linkPayment";

const taxTypes: Record<LinkPaymentTaxType, string> = {
  TAX: "과세",
  FREE: "면세",
};

const taxTypeOptions = [
  { label: "과세", value: "TAX" },
  { label: "면세", value: "FREE" },
] satisfies { label: string; value: LinkPaymentTaxType }[];

const taxDeductOptions = [
  { label: "적용", value: "CULTURAL" },
  { label: "적용 안함", value: "NORMAL" },
] satisfies { label: string; value: LinkPaymentTaxDeductType }[];

function getStringProperty(
  source: Record<string, unknown> | null | undefined,
  key: string,
) {
  const value = source?.[key];
  return typeof value === "string" ? value : "";
}

function getTaxTypeProperty(
  source: Record<string, unknown> | null | undefined,
) {
  return source?.taxType === "FREE" ? "FREE" : "TAX";
}

function createDirectGoods({
  name,
  price,
  taxType,
}: {
  name: string;
  price: number | string;
  taxType: LinkPaymentTaxType;
}): LinkPaymentGoods {
  return {
    ord: 0,
    count: 1,
    goodsType: "DIRECT",
    name,
    price,
    taxType,
  };
}

function RequiredMark() {
  return (
    <span aria-hidden="true" className={classes.requiredMark}>
      <img alt="" className={classes.requiredIcon} src={iconRequire} />
    </span>
  );
}

function CulturalTaxTooltip() {
  return (
    <div className={classes.tooltipContent} role="tooltip">
      <PKText as="strong" className={classes.tooltipTitle} weight={500}>
        문화비 소득공제는 무엇인가요?
      </PKText>
      <PKText as="p" className={classes.tooltipParagraph}>
        총 급여가 7천만 원 이하인 근로소득자는 카드·현금영수증 등으로 사용한
        문화비에 대해 연 300만 원 한도 내에서, 그중 최대 100만 원까지 30%
        소득공제를 추가로 받을 수 있습니다.
      </PKText>
      <PKText as="p" className={classes.tooltipParagraph}>
        <PKText as="strong" className={classes.tooltipStrong} weight={500}>
          적용대상(종목) :
        </PKText>{" "}
        수영장·체력단련장 체육시설 이용료, 도서 구입비, 공연/영화 관람료 등
      </PKText>
    </div>
  );
}

function TooltipButton() {
  const [open, setOpen] = useState(false);

  return (
    <span className={classes.tooltipWrap}>
      <button
        aria-expanded={open}
        aria-label="문화비 소득공제 안내"
        className={classes.tooltipButton}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen((prev) => !prev)}
        type="button"
      >
        <CircleHelp size={16} strokeWidth={1.8} />
      </button>
      {open && <CulturalTaxTooltip />}
    </span>
  );
}

function InputLabelWrap({
  label,
  required = false,
  children,
  helper,
  tooltip = false,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
  helper?: ReactNode;
  tooltip?: boolean;
}) {
  return (
    <div className={classes.field}>
      <div className={classes.labelRow}>
        <PKText as="label" className={classes.label} weight={400}>
          {label}
        </PKText>
        {required && <RequiredMark />}
        {tooltip && <TooltipButton />}
      </div>
      {children}
      {helper ? (
        <PKText as="p" className={classes.helper} weight={400}>
          {helper}
        </PKText>
      ) : null}
    </div>
  );
}

export const LinkPaymentActivity: ActivityComponentType<"linkPayment"> = () => {
  const navigation = useAppNavigation();
  const params = useActivityParams<"linkPayment">();
  const agent = useUserStore((state) => state.agent);
  const showAlert = useAlertStore((state) => state.showAlert);
  const agentRecord = agent as Record<string, unknown> | null;
  const isCultTax = Boolean(agent?.submitDocs?.isCultTax);
  const [entryMode, setEntryMode] = useState<LinkPaymentEntryMode>("MAIN");
  const [taxDeductType, setTaxDeductType] =
    useState<LinkPaymentTaxDeductType>("NORMAL");
  const [selectedGoodsList, setSelectedGoodsList] = useState<
    LinkPaymentGoods[]
  >([]);
  const [sendLinkModalOpen, setSendLinkModalOpen] = useState(false);
  const isDirect = entryMode === "MAIN" || entryMode === "INPUT";
  const totalPrice = useMemo(
    () => calculateTotalPrice(selectedGoodsList),
    [selectedGoodsList],
  );
  const directGoods = selectedGoodsList[0];

  useEffect(() => {
    const defaultGoodsName = getStringProperty(agentRecord, "defaultGoodsName");
    const defaultTaxType = getTaxTypeProperty(agentRecord);

    if (params.selectedGoodsList?.length) {
      setSelectedGoodsList(params.selectedGoodsList);
      setEntryMode("GOODS");
      return;
    }

    if (params.enterPrice != null) {
      setSelectedGoodsList([
        createDirectGoods({
          name: defaultGoodsName,
          price: params.enterPrice,
          taxType: defaultTaxType,
        }),
      ]);
      setEntryMode("INPUT");
      return;
    }

    setSelectedGoodsList([
      createDirectGoods({
        name: defaultGoodsName,
        price: 0,
        taxType: defaultTaxType,
      }),
    ]);
    setEntryMode("MAIN");
  }, [agentRecord, params.enterPrice, params.selectedGoodsList]);

  const updateDirectGoods = (next: Partial<LinkPaymentGoods>) => {
    setSelectedGoodsList((prev) => {
      const current =
        prev[0] ??
        createDirectGoods({
          name: "",
          price: 0,
          taxType: getTaxTypeProperty(agentRecord),
        });

      return [{ ...current, ...next }];
    });
  };

  const updateGoodsCount = (item: LinkPaymentGoods, type: "plus" | "minus") => {
    setSelectedGoodsList((prev) =>
      prev.map((goods) => {
        if (goods.id !== item.id && goods.ord !== item.ord) return goods;

        const count = Number(goods.count) || 0;
        if (type === "minus" && count <= 0) return goods;

        return {
          ...goods,
          count: type === "plus" ? count + 1 : count - 1,
        };
      }),
    );
  };

  const deleteGoods = (item: LinkPaymentGoods) => {
    setSelectedGoodsList((prev) =>
      prev.filter((goods) => goods.id !== item.id || goods.ord !== item.ord),
    );
  };

  const handleSelectGoods = () => {
    showAlert({
      title: "상품 불러오기",
      contents: "상품 선택 화면 연결은 다음 단계에서 진행합니다.",
    });
  };

  const handleInterestFreeInfo = () => {
    showAlert({
      title: "무이자할부 안내",
      contents: "무이자할부 안내 화면 연결은 다음 단계에서 진행합니다.",
    });
  };

  const validateBeforeSubmit = () => {
    if (isDirect && !directGoods?.name?.trim()) return;

    if (totalPrice < 1000) {
      showAlert({
        title: "알림",
        contents: "1,000원 부터 결제 가능합니다.",
      });
      return;
    }

    return true;
  };

  const handleSubmit = (type: "QR" | "LINK") => {
    if (!validateBeforeSubmit()) return;

    if (type === "LINK") {
      setSendLinkModalOpen(true);
      return;
    }

    showAlert({
      title: "QR코드 만들기",
      contents: "결제 링크 생성 API 연결은 다음 단계에서 진행합니다.",
    });
  };

  const handleSendLink = (phoneNumber: string) => {
    setSendLinkModalOpen(false);
    showAlert({
      title: "링크 보내기",
      contents: `${phoneNumber} 번호로 결제 링크를 전송하는 API 연결은 다음 단계에서 진행합니다.`,
    });
  };

  return (
    <AppContainer
      className={classes.screen}
      contentClassName={classes.content}
      bottomChildren={
        <div className={classes.bottom}>
          <PKText as="p" className={classes.installmentNotice}>
            무이자할부는 결제자가 직접 선택할 수 있습니다.
          </PKText>
          <PKButton
            type="standard"
            className={classes.interestButton}
            colorType="solid-primary"
            onClick={handleInterestFreeInfo}
            title="무이자할부 안내"
          />
          <div className={classes.actionRow}>
            <PKButton
              type="standard"
              disabled={isDirect && !directGoods?.name?.trim()}
              onClick={() => handleSubmit("QR")}
              title="QR코드 만들기"
            />
            <PKButton
              type="standard"
              disabled={isDirect && !directGoods?.name?.trim()}
              onClick={() => handleSubmit("LINK")}
              title="링크 보내기"
            />
          </div>
        </div>
      }
      topChildren={
        <AppHeader onBack={navigation.goBack} title="링크/QR코드 결제" />
      }
    >
      {isDirect ? (
        <section className={classes.directForm}>
          {entryMode === "INPUT" && (
            <div className={classes.amountCard}>
              <PKText as="p" className={classes.amountLabel}>
                결제 금액
              </PKText>
              <PKText as="p" className={classes.amountValue} weight={600}>
                {addCommasToNumber(directGoods?.price)}원
              </PKText>
            </div>
          )}

          <InputLabelWrap label="상품명" required>
            <PKInput
              onChangeText={(name) => updateDirectGoods({ name })}
              placeholder="상품명을 입력하세요."
              value={directGoods?.name ?? ""}
            />
          </InputLabelWrap>

          {entryMode === "MAIN" && (
            <InputLabelWrap label="상품금액" required>
              <PKInput
                onChangeText={(price) => updateDirectGoods({ price })}
                placeholder="1,000원 이상 입력하세요."
                type="price"
                value={String(directGoods?.price ?? "")}
              />
            </InputLabelWrap>
          )}

          <InputLabelWrap label="과세/면세" required>
            <PKRadioGroup
              className={classes.radioGroup}
              multiple={false}
              onChange={(value) => {
                updateDirectGoods({
                  taxType: (value?.[0] ?? "TAX") as LinkPaymentTaxType,
                });
              }}
              options={taxTypeOptions}
              value={directGoods?.taxType ? [directGoods.taxType] : ["TAX"]}
            />
          </InputLabelWrap>

          {isCultTax && (
            <InputLabelWrap
              helper="하나카드는 문화비소득공제 적용이 불가합니다."
              label="문화비 소득공제"
              tooltip
            >
              <PKRadioGroup
                className={classes.radioGroup}
                multiple={false}
                onChange={(value) => {
                  setTaxDeductType(
                    (value?.[0] ?? "NORMAL") as LinkPaymentTaxDeductType,
                  );
                }}
                options={taxDeductOptions}
                value={[taxDeductType]}
              />
            </InputLabelWrap>
          )}
        </section>
      ) : (
        <section className={classes.goodsMode}>
          <div className={classes.goodsHeader}>
            <div className={classes.goodsTitleWrap}>
              <PKText as="h2" className={classes.goodsTitle} weight={200}>
                선택된 상품 목록
              </PKText>
              <RequiredMark />
            </div>
            <PKButton
              type="standard"
              className={classes.loadGoodsButton}
              onClick={handleSelectGoods}
              textClassName={classes.loadGoodsText}
              title="불러오기"
            />
          </div>

          <div className={classes.goodsList}>
            {selectedGoodsList.length ? (
              selectedGoodsList.map((item, index) => (
                <article
                  className={classes.goodsCard}
                  key={item.id ?? item.ord ?? index}
                >
                  <div className={classes.goodsRow}>
                    <PKText as="p" className={classes.goodsName} weight={500}>
                      {item.name}
                    </PKText>
                    <div className={classes.goodsMeta}>
                      <span className={classes.taxBadge}>
                        {taxTypes[item.taxType]}
                      </span>
                      <button
                        aria-label="상품 삭제"
                        className={classes.iconButton}
                        onClick={() => deleteGoods(item)}
                        type="button"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  </div>
                  <div className={classes.goodsRow}>
                    <div className={classes.countWrap}>
                      <button
                        aria-label="수량 감소"
                        className={classes.iconButton}
                        disabled={(Number(item.count) || 0) <= 0}
                        onClick={() => updateGoodsCount(item, "minus")}
                        type="button"
                      >
                        <Minus size={20} />
                      </button>
                      <PKText
                        as="span"
                        className={classes.countText}
                        weight={500}
                      >
                        {item.count}
                      </PKText>
                      <button
                        aria-label="수량 증가"
                        className={classes.iconButton}
                        onClick={() => updateGoodsCount(item, "plus")}
                        type="button"
                      >
                        <Plus size={20} />
                      </button>
                    </div>
                    <PKText as="p" className={classes.goodsPrice} weight={600}>
                      {addCommasToNumber(
                        Number(item.price) * Number(item.count) || 0,
                      )}
                      원
                    </PKText>
                  </div>
                </article>
              ))
            ) : (
              <PKText as="p" className={classes.emptyText} weight={200}>
                선택된 상품이 없습니다.
              </PKText>
            )}
          </div>

          {isCultTax && (
            <div className={classes.cultTaxPanel}>
              <InputLabelWrap
                helper="하나카드는 문화비소득공제 적용이 불가합니다."
                label="문화비 소득공제"
                tooltip
              >
                <PKRadioGroup
                  className={classes.radioGroup}
                  multiple={false}
                  onChange={(value) => {
                    setTaxDeductType(
                      (value?.[0] ?? "NORMAL") as LinkPaymentTaxDeductType,
                    );
                  }}
                  options={taxDeductOptions}
                  value={[taxDeductType]}
                />
              </InputLabelWrap>
            </div>
          )}

          <div className={classes.totalRow}>
            <PKText as="p" className={classes.totalLabel}>
              총 금액
            </PKText>
            <PKText as="p" className={classes.totalValue} weight={600}>
              {addCommasToNumber(totalPrice)}원
            </PKText>
          </div>
        </section>
      )}
      <SendLinkModal
        closeClear
        onClose={() => setSendLinkModalOpen(false)}
        onSend={handleSendLink}
        visible={sendLinkModalOpen}
      />
    </AppContainer>
  );
};

const classes = {
  screen: "bg-white text-[var(--pk-text)]",
  content: "flex min-h-full flex-col bg-white px-6 py-[15px]",
  directForm: "grid flex-1 content-start gap-6",
  amountCard:
    "mb-[-8px] grid place-items-center gap-2 rounded-[20px] bg-[#f1f2f5] px-4 py-4 text-center",
  amountLabel: "m-0 text-[14px] leading-[1.2] text-[#191919]",
  amountValue: "m-0 text-[24px] leading-[1.25] text-[#191919]",
  field: "grid gap-2",
  labelRow: "flex min-h-5 items-start gap-1 pl-1",
  label: "m-0 text-[14px] leading-5 text-[#575e6b]",
  requiredMark: "inline-flex h-5 items-start",
  requiredIcon: "h-2 w-2 shrink-0",
  tooltipWrap: "relative inline-flex h-5 items-center",
  tooltipButton:
    "inline-flex h-5 w-5 items-center justify-center rounded-full border-0 bg-transparent p-0 text-[#99a2b0]",
  tooltipContent:
    "absolute left-1/2 top-[calc(100%+8px)] z-[60] grid w-[min(280px,calc(100vw-80px))] -translate-x-1/2 gap-[14px] rounded-xl bg-white p-4 text-left shadow-[0_8px_24px_rgba(0,0,0,0.16)] ring-1 ring-black/5",
  tooltipTitle: "m-0 text-[13px] leading-[1.4] text-[#191919]",
  tooltipParagraph: "m-0 text-[12px] leading-[1.55] text-[#8b9099]",
  tooltipStrong: "text-[12px] leading-[1.55] text-[#191919]",
  helper: "m-0 text-[12px] leading-[1.45] text-[#8b9099]",
  radioGroup: "gap-2",
  goodsMode: "flex flex-1 flex-col gap-4 overflow-hidden",
  goodsHeader: "flex items-center justify-between gap-3",
  goodsTitleWrap: "flex items-start gap-1 pl-1",
  goodsTitle: "m-0 text-[14px] leading-5 text-[#191919]",
  loadGoodsButton: "h-[34px] min-h-[34px] w-auto rounded-xl px-4",
  loadGoodsText: "text-[12px] font-medium",
  goodsList: "grid min-h-[52px] gap-2",
  goodsCard:
    "grid gap-2 rounded-[10px] border border-solid border-[#e7e9ee] py-[14px]",
  goodsRow: "flex items-center justify-between gap-2 px-[14px]",
  goodsName:
    "m-0 min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-[14px] leading-[1.35] text-[#191919]",
  goodsMeta: "flex shrink-0 items-center gap-2",
  taxBadge:
    "inline-flex h-5 w-9 items-center justify-center rounded-[5px] bg-[#e7e9ee] font-[var(--pk-font-scd)] text-[10px] font-semibold leading-none text-[#8b9099]",
  iconButton:
    "inline-flex h-7 w-7 items-center justify-center rounded-full border-0 bg-transparent p-0 text-[#99a2b0] disabled:opacity-30",
  countWrap: "flex items-center gap-1",
  countText: "m-0 min-w-5 text-center text-[14px] leading-none text-[#191919]",
  goodsPrice:
    "m-0 shrink-0 text-right text-[20px] leading-[1.2] text-[#191919]",
  emptyText:
    "m-0 pt-[60px] text-center text-[14px] leading-[1.4] text-[#191919]",
  cultTaxPanel: "border-y border-solid border-[#e7e9ee] py-4",
  totalRow: "mb-5 mt-auto flex items-center justify-between gap-4",
  totalLabel: "m-0 text-[14px] leading-[1.2] text-[#191919]",
  totalValue: "m-0 text-[20px] leading-[1.2] text-[#191919]",
  bottom: "grid gap-2",
  installmentNotice: "m-0 text-center text-[10px] leading-[1.2] text-[#8b9099]",
  interestButton: "h-14",
  actionRow: "flex gap-2",
};
