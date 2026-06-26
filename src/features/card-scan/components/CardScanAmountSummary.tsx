import { PKText } from "../../../components";
import { addCommasToNumber } from "../../../utils/format";

type CardScanAmountSummaryProps = {
  amount: number;
};

export function CardScanAmountSummary({ amount }: CardScanAmountSummaryProps) {
  return (
    <div className={classes.amountCard}>
      <PKText as="p" className={classes.amountLabel}>
        결제 금액
      </PKText>
      <PKText as="p" className={classes.amountValue} weight={600}>
        {addCommasToNumber(amount)}원
      </PKText>
    </div>
  );
}

const classes = {
  amountCard:
    "grid place-items-center gap-2 rounded-[20px] bg-[#f1f2f5] px-4 py-4 text-center",
  amountLabel: "m-0 text-[14px] leading-[1.2] text-[#191919]",
  amountValue: "m-0 text-[24px] leading-[1.25] text-[#191919]",
};

