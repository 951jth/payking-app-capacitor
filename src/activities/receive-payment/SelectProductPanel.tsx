import { useEffect, useMemo, useState } from "react";
import iconArrowRight16 from "../../assets/icons/Icon_arrow_right_16.svg";
import iconChecked from "../../assets/icons/Icon_checked.svg";
import iconCloseBlack20 from "../../assets/icons/Icon_close_black_20.svg";
import iconMinusGray from "../../assets/icons/Icon_minus_gray.svg";
import iconPaykingGray from "../../assets/icons/Icon_payking_gray.svg";
import iconPlus14 from "../../assets/icons/Icon_plus_blue_14.svg";
import iconPlusBlack14 from "../../assets/icons/Icon_plus_black_14.svg";
import iconPlusBlue from "../../assets/icons/Icon_plus_blue.svg";
import {
  getPaymentMethodTitle,
  PaymentMethodGrid,
  PKButton,
  PKText,
} from "../../components";
import type { PaymentMethod } from "../../components";
import { useAppNavigation } from "../../navigation/useAppNavigation";
import store from "../../service/store";
import { useAlertStore } from "../../stores/alertStore";
import type {
  LinkPaymentGoods,
  LinkPaymentTaxType,
} from "../../types/linkPayment";
import { addCommasToNumber } from "../../utils/format";

const taxTypes: Record<LinkPaymentTaxType, string> = {
  TAX: "과세",
  FREE: "면세",
};

type GoodsImage = {
  fileUrl?: string;
  [key: string]: unknown;
};

export type SelectableGoods = LinkPaymentGoods & {
  goodsImages?: GoodsImage[];
};

type GoodsListItem = Pick<
  SelectableGoods,
  | "id"
  | "code"
  | "ord"
  | "name"
  | "price"
  | "taxType"
  | "goodsType"
  | "goodsImages"
>;

type GoodsListResponse = {
  data?: {
    data?: GoodsListItem[];
  };
};

function toSelectableGoods(goods: GoodsListItem): SelectableGoods {
  return {
    ...goods,
    count: 0,
  };
}

function getGoodsKey(item: SelectableGoods) {
  return String(item.id ?? item.code ?? item.ord ?? item.name);
}

export function SelectProductPanel() {
  const navigation = useAppNavigation();
  const showAlert = useAlertStore((state) => state.showAlert);
  const [goodsList, setGoodsList] = useState<SelectableGoods[]>([]);
  const [selectedGoodsList, setSelectedGoodsList] = useState<SelectableGoods[]>(
    [],
  );
  const [seeMore, setSeeMore] = useState(false);

  const totalPrice = useMemo(
    () =>
      selectedGoodsList.reduce((acc, item) => {
        if (item.count <= 0) return acc;
        return acc + (Number(item.price) * Number(item.count) || 0);
      }, 0),
    [selectedGoodsList],
  );

  const visibleGoodsList = useMemo(() => {
    if (seeMore) return goodsList;
    return goodsList.slice(0, 6);
  }, [goodsList, seeMore]);

  const selectedGoodsKeySet = useMemo(
    () => new Set(selectedGoodsList.map(getGoodsKey)),
    [selectedGoodsList],
  );

  useEffect(() => {
    let ignore = false;

    store
      .getMyGoodsList({ isDeleted: false })
      .then((res: GoodsListResponse) => {
        if (ignore) return;

        const nextGoodsList =
          res.data?.data?.map(toSelectableGoods) ?? [];

        setGoodsList(nextGoodsList);
      })
      .catch((error: unknown) => {
        console.error("상품 목록 조회 실패:", error);
      });

    return () => {
      ignore = true;
    };
  }, []);

  const updateGoodsCount = (item: SelectableGoods, type: "plus" | "minus") => {
    const itemKey = getGoodsKey(item);

    setSelectedGoodsList((prev) =>
      prev.map((goods) => {
        if (getGoodsKey(goods) !== itemKey) return goods;

        const count = Number(goods.count) || 0;
        if (type === "minus" && count <= 1) return goods;

        return {
          ...goods,
          count: type === "plus" ? count + 1 : count - 1,
        };
      }),
    );
  };

  const deleteGoods = (item: SelectableGoods) => {
    setSelectedGoodsList((prev) =>
      prev.filter((goods) => getGoodsKey(goods) !== getGoodsKey(item)),
    );
  };

  const toggleGoods = (item: SelectableGoods) => {
    const itemKey = getGoodsKey(item);

    setSelectedGoodsList((prev) => {
      if (prev.some((goods) => getGoodsKey(goods) === itemKey)) {
        return prev.filter((goods) => getGoodsKey(goods) !== itemKey);
      }

      return [
        ...prev,
        {
          ...item,
          count: 1,
        },
      ];
    });
  };

  const handleAddGoods = () => {
    showAlert({
      title: "상품 추가하기",
      contents: "상품 등록 화면은 다음 단계에서 연결합니다.",
    });
  };

  const handlePaymentMethod = (method: PaymentMethod) => {
    if (method === "SAVED_LINK") {
      showAlert({
        title: "저장 링크 결제",
        contents: "저장 링크 목록 화면은 다음 단계에서 연결합니다.",
      });
      return;
    }

    const payableGoodsList = selectedGoodsList.filter((item) => item.count > 0);

    if (totalPrice < 1000) {
      showAlert({
        title: getPaymentMethodTitle(method),
        contents: "1,000원 부터 결제 가능합니다.",
      });
      return;
    }

    if (method === "CARD_SCAN") {
      showAlert({
        title: "카드 스캔 결제",
        contents:
          "카드 스캔 결제는 Capacitor 네이티브 플러그인 구현 후 연결합니다.",
      });
      return;
    }

    navigation.navigate("linkPayment", {
      selectedGoodsList: payableGoodsList,
    });
  };

  return (
    <div className={classes.panel}>
      <div className={classes.amountWrap}>
        <PKText as="p" className={classes.amount} weight={500}>
          {addCommasToNumber(totalPrice)}
        </PKText>
      </div>
      <section aria-label="선택 상품 목록" className={classes.selectedGoodsList}>
        {selectedGoodsList.length ? (
          selectedGoodsList.map((item, index) => (
            <article className={classes.goodsCard} key={item.id ?? index}>
              <div className={classes.goodsRow}>
                <PKText
                  as="p"
                  className={classes.goodsName}
                  numberOfLines={1}
                  weight={500}
                >
                  {item.name}
                </PKText>
                <div className={classes.goodsMeta}>
                  <PKText as="span" className={classes.taxBadge} weight={600}>
                    {taxTypes[item.taxType]}
                  </PKText>
                  <PKButton
                    aria-label={`${item.name} 삭제`}
                    className={classes.iconButton}
                    onPress={() => deleteGoods(item)}
                    title={
                      <img
                        alt=""
                        className={classes.iconImage}
                        src={iconCloseBlack20}
                      />
                    }
                    type="custom"
                  />
                </div>
              </div>
              <div className={classes.goodsRow}>
                <div className={classes.countWrap}>
                  {item.count > 1 ? (
                    <PKButton
                      aria-label={`${item.name} 수량 감소`}
                      className={classes.iconButton}
                      onPress={() => updateGoodsCount(item, "minus")}
                      title={
                        <img
                          alt=""
                          className={classes.iconImage}
                          src={iconMinusGray}
                        />
                      }
                      type="custom"
                    />
                  ) : (
                    <span aria-hidden="true" className={classes.iconSpacer} />
                  )}
                  <PKText as="span" className={classes.countText} weight={500}>
                    {item.count}
                  </PKText>
                  <PKButton
                    aria-label={`${item.name} 수량 증가`}
                    className={classes.iconButton}
                    onPress={() => updateGoodsCount(item, "plus")}
                    title={
                      <img
                        alt=""
                        className={classes.iconImage}
                        src={iconPlusBlue}
                      />
                    }
                    type="custom"
                  />
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
          <div className={classes.emptySelectedGoods}>
            <PKText as="p" className={classes.emptyText} weight={200}>
              상품을 선택해주세요.
            </PKText>
          </div>
        )}
      </section>
      <section aria-label="상품 선택" className={classes.goodsPickerWrap}>
        {visibleGoodsList.length ? (
          <div className={classes.goodsPickerGrid}>
            {visibleGoodsList.map((item) => {
              const itemKey = getGoodsKey(item);
              const selected = selectedGoodsKeySet.has(itemKey);
              const goodsImageUrl = item.goodsImages?.[0]?.fileUrl;

              return (
                <button
                  aria-pressed={selected}
                  className={classes.goodsPickerItem}
                  key={itemKey}
                  onClick={() => toggleGoods(item)}
                  type="button"
                >
                  <span className={classes.goodsImageWrap}>
                    {goodsImageUrl ? (
                      <img
                        alt=""
                        className={classes.goodsImage}
                        src={goodsImageUrl}
                      />
                    ) : (
                      <span className={classes.goodsImagePlaceholder}>
                        <img
                          alt=""
                          className={classes.paykingIcon}
                          src={iconPaykingGray}
                        />
                      </span>
                    )}
                    {selected && (
                      <span className={classes.selectedBadge}>
                        <img
                          alt=""
                          className={classes.checkedIcon}
                          src={iconChecked}
                        />
                      </span>
                    )}
                  </span>
                  <span className={classes.goodsPickerInfo}>
                    <PKText
                      as="span"
                      className={classes.goodsPickerName}
                      numberOfLines={1}
                      weight={400}
                    >
                      {item.name}
                    </PKText>
                    <PKText
                      as="span"
                      className={classes.goodsPickerPrice}
                      numberOfLines={1}
                      weight={500}
                    >
                      {addCommasToNumber(item.price)}원
                    </PKText>
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className={classes.emptyGoodsPicker}>
            <PKText as="p" className={classes.emptyText} weight={200}>
              등록된 상품이 없습니다.
            </PKText>
            <PKButton
              className={classes.emptyAddButton}
              onPress={handleAddGoods}
              title={
                <span className={classes.addButtonContent}>
                  <img alt="" className={classes.addIcon} src={iconPlus14} />
                  <PKText
                    as="span"
                    className={classes.emptyAddButtonText}
                    weight={500}
                  >
                    상품 추가하기
                  </PKText>
                </span>
              }
              type="standard"
            />
          </div>
        )}
      </section>
      {visibleGoodsList.length > 0 && (
        <div className={classes.goodsActions}>
          <PKButton
            className={classes.textActionButton}
            onPress={handleAddGoods}
            title={
              <span className={classes.addButtonContent}>
                <img alt="" className={classes.addIcon} src={iconPlusBlack14} />
                <PKText
                  as="span"
                  className={classes.textActionButtonText}
                  weight={400}
                >
                  상품 추가하기
                </PKText>
              </span>
            }
            type="text"
          />
          {goodsList.length > 6 && (
            <PKButton
              className={classes.textActionButton}
              onPress={() => setSeeMore((prev) => !prev)}
              title={
                <span className={classes.addButtonContent}>
                  <PKText
                    as="span"
                    className={classes.moreButtonText}
                    weight={200}
                  >
                    {seeMore ? "숨기기" : "더보기"}
                  </PKText>
                  <img
                    alt=""
                    className={classes.arrowIcon}
                    src={iconArrowRight16}
                  />
                </span>
              }
              type="text"
            />
          )}
        </div>
      )}
      <PaymentMethodGrid onSelect={handlePaymentMethod} />
    </div>
  );
}

const classes = {
  panel: "grid min-h-[280px] content-start gap-3",
  amountWrap:
    "flex justify-end overflow-x-auto py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
  amount:
    "m-0 whitespace-nowrap text-right text-[50px] leading-[1.2] text-[#191919]",
  selectedGoodsList: "grid min-h-[52px] gap-2 rounded-2xl",
  goodsCard:
    "grid gap-2 rounded-[10px] border border-solid border-[#e7e9ee] py-[14px]",
  goodsRow: "flex items-center justify-between gap-2 px-4",
  goodsName:
    "m-0 min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-[14px] leading-[1.35] text-[#191919]",
  goodsMeta: "flex shrink-0 items-center gap-2",
  taxBadge:
    "inline-flex h-5 w-9 items-center justify-center rounded-[5px] bg-[#e7e9ee] text-[10px] leading-none text-[#8b9099]",
  iconButton:
    "inline-flex h-7 min-h-0 w-7 items-center justify-center rounded-full border-0 bg-transparent !p-1",
  iconImage: "h-5 w-5 object-contain",
  iconSpacer: "h-6 w-6",
  countWrap: "flex items-center gap-1",
  countText: "m-0 min-w-5 text-center text-[14px] leading-none text-[#191919]",
  goodsPrice:
    "m-0 shrink-0 text-right text-[20px] leading-[1.2] text-[#191919]",
  emptySelectedGoods:
    "flex h-[68px] items-center justify-center rounded-[10px] border border-solid border-[#e7e9ee]",
  emptyText: "m-0 text-center text-[14px] leading-5 text-[#191919]",
  goodsPickerWrap: "mx-[-20px] mt-[-2px]",
  goodsPickerGrid: "grid grid-cols-3 gap-x-[10px] gap-y-4 px-5 py-2.5",
  goodsPickerItem:
    "grid min-w-0 gap-2 border-0 bg-transparent p-0 text-center font-[var(--pk-font-scd)]",
  goodsImageWrap:
    "relative block aspect-square w-full overflow-hidden rounded-2xl bg-[#f1f2f5]",
  goodsImage: "h-full w-full object-cover",
  goodsImagePlaceholder:
    "flex h-full w-full items-center justify-center rounded-2xl bg-[#f1f2f5]",
  paykingIcon: "h-8 w-8 object-contain",
  selectedBadge: "absolute right-0 top-0 flex p-2",
  checkedIcon: "h-6 w-6 object-contain",
  goodsPickerInfo: "grid min-w-0 justify-items-center gap-1",
  goodsPickerName:
    "m-0 max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-[12px] leading-[1.25] text-[#191919]",
  goodsPickerPrice:
    "m-0 max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-[14px] leading-[1.25] text-[#191919]",
  emptyGoodsPicker:
    "flex min-h-[180px] flex-col items-center justify-center gap-4 px-5 py-[60px]",
  emptyAddButton:
    "h-6 min-h-0 rounded-lg px-3 py-0",
  addButtonContent: "inline-flex items-center justify-center gap-0.5",
  addIcon: "h-3.5 w-3.5 object-contain",
  emptyAddButtonText: "text-[10px] leading-none text-[#145ed9]",
  goodsActions:
    "mt-[-20px] mb-[-10px] flex items-center justify-between gap-2",
  textActionButton: "h-auto min-h-0 px-0 py-4",
  textActionButtonText: "text-[12px] leading-none text-[#191919]",
  moreButtonText: "text-[12px] leading-none text-[#191919]",
  arrowIcon: "h-4 w-4 object-contain",
};
