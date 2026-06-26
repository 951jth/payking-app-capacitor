import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { BottomModal, PKText } from "../../../components";
import type {
  CardScanInstallmentMonth,
  CardScanIssueBank,
} from "../../../types/cardScan";

type CardScanPaymentSelectorsProps = {
  issueBankList: CardScanIssueBank[];
  installmentList: CardScanInstallmentMonth[];
  selectedBank: CardScanIssueBank | null;
  selectedInstallment?: CardScanInstallmentMonth;
  onSelectBank: (bank: CardScanIssueBank) => void;
  onSelectInstallment: (installment: CardScanInstallmentMonth) => void;
};

function CardScanSelectButton({
  label,
  placeholder,
  onClick,
}: {
  label?: string;
  placeholder: string;
  onClick: () => void;
}) {
  return (
    <button className={classes.selectButton} onClick={onClick} type="button">
      <span className={label ? classes.selectText : classes.selectPlaceholder}>
        {label || placeholder}
      </span>
      <ChevronDown size={20} />
    </button>
  );
}

export function CardScanPaymentSelectors({
  issueBankList,
  installmentList,
  selectedBank,
  selectedInstallment,
  onSelectBank,
  onSelectInstallment,
}: CardScanPaymentSelectorsProps) {
  const [bankModalOpen, setBankModalOpen] = useState(false);
  const [installmentModalOpen, setInstallmentModalOpen] = useState(false);

  return (
    <>
      <div className={classes.field}>
        <PKText as="label" className={classes.label}>
          카드사 및 할부 선택
        </PKText>
        <div className={classes.selectRow}>
          <CardScanSelectButton
            label={selectedBank?.name}
            onClick={() => setBankModalOpen(true)}
            placeholder="카드사 선택"
          />
          <CardScanSelectButton
            label={selectedInstallment?.label}
            onClick={() => setInstallmentModalOpen(true)}
            placeholder="할부 선택"
          />
        </div>
      </div>

      <BottomModal
        onClose={() => setBankModalOpen(false)}
        title="카드사 선택"
        visible={bankModalOpen}
      >
        <div className={classes.sheetGrid}>
          {issueBankList.map((bank) => (
            <button
              className={classes.bankButton}
              key={bank.code}
              onClick={() => {
                onSelectBank(bank);
                setBankModalOpen(false);
              }}
              type="button"
            >
              <span className={classes.bankLogoWrap}>
                {bank.imageUrl ? (
                  <img alt="" className={classes.bankLogo} src={bank.imageUrl} />
                ) : null}
              </span>
              <span className={classes.bankName}>{bank.name}</span>
            </button>
          ))}
        </div>
      </BottomModal>

      <BottomModal
        onClose={() => setInstallmentModalOpen(false)}
        title="할부 선택"
        visible={installmentModalOpen}
      >
        <div className={classes.installmentList}>
          {installmentList.map((option) => (
            <button
              className={classes.installmentButton}
              key={option.value}
              onClick={() => {
                onSelectInstallment(option);
                setInstallmentModalOpen(false);
              }}
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>
      </BottomModal>
    </>
  );
}

const classes = {
  field: "grid gap-2",
  label: "m-0 pl-1 text-[14px] leading-5 text-[#575e6b]",
  selectRow: "grid grid-cols-2 gap-2",
  selectButton:
    "flex h-12 min-w-0 items-center justify-between gap-1 border-0 border-b border-solid border-[#f1f2f4] bg-white px-1 font-[var(--pk-font-scd)] text-left",
  selectText:
    "min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-[14px] font-medium text-[#191919]",
  selectPlaceholder:
    "min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-[14px] font-medium text-[#c7ced9]",
  sheetGrid:
    "grid grid-cols-3 gap-2 px-5 pb-[calc(20px+env(safe-area-inset-bottom))] pt-3",
  bankButton:
    "grid min-h-[94px] place-items-center gap-2 rounded-[20px] border-0 bg-[#f4f5f8] px-2 py-3 font-[var(--pk-font-scd)]",
  bankLogoWrap: "flex h-10 w-full items-center justify-center",
  bankLogo: "max-h-10 max-w-full object-contain",
  bankName: "text-center text-[12px] leading-[1.25] text-[#191919]",
  installmentList:
    "grid gap-1 px-5 pb-[calc(20px+env(safe-area-inset-bottom))] pt-2",
  installmentButton:
    "h-12 border-0 border-b border-solid border-[#f1f2f4] bg-white text-left font-[var(--pk-font-scd)] text-[15px] text-[#191919]",
};

