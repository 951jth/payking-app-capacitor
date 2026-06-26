import { useEffect, useRef, useState } from "react";
import iconClear from "../../assets/icons/Icon_calc_clear.svg";
import iconClearX from "../../assets/icons/Icon_calc_clear_x.svg";
import iconDivide from "../../assets/icons/Icon_calc_divide.svg";
import iconMinus from "../../assets/icons/Icon_calc_minus.svg";
import iconMultiply from "../../assets/icons/Icon_calc_multiply.svg";
import iconPlus from "../../assets/icons/Icon_calc_plus.svg";
import { addCommasToNumber } from "../../utils/format";
import { PKButton } from "../button/PKButton";
import { PKText } from "../typography/PKText";

type Operator = "+" | "-" | "×" | "÷";

type PKCalculatorProps = {
  initialExpression?: string;
  onChangeAmount?: (amount: number) => void;
};

const operatorPattern = /[+\-×÷]/;
const trailingOperatorPattern = /[+\-×÷]$/;

function formatExpression(expression: string) {
  return expression
    .split(/([+\-×÷])/)
    .map((token) =>
      operatorPattern.test(token) ? token : addCommasToNumber(token),
    )
    .join("");
}

function evaluateExpression(expression: string) {
  const tokens = expression.match(/(\d+|[+\-×÷])/g);
  if (!tokens?.length) return 0;

  let total = Number(tokens[0]);

  for (let index = 1; index < tokens.length; index += 2) {
    const operator = tokens[index] as Operator | undefined;
    const nextNumber = Number(tokens[index + 1]);

    if (!operator || !Number.isFinite(nextNumber)) break;

    if (operator === "+") total += nextNumber;
    if (operator === "-") total -= nextNumber;
    if (operator === "×") total *= nextNumber;
    if (operator === "÷") total /= nextNumber;
  }

  return Number.isFinite(total) ? Math.floor(total) : 0;
}

export function PKCalculator({
  initialExpression = "0",
  onChangeAmount,
}: PKCalculatorProps) {
  const deleteIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const expressionScrollRef = useRef<HTMLDivElement | null>(null);
  const resultScrollRef = useRef<HTMLDivElement | null>(null);
  const [expression, setExpression] = useState(initialExpression || "0");
  const [result, setResult] = useState(() =>
    evaluateExpression(initialExpression || "0"),
  );

  useEffect(() => {
    if (trailingOperatorPattern.test(expression)) return;

    const nextResult = evaluateExpression(expression);
    setResult(nextResult);
    onChangeAmount?.(nextResult);
  }, [expression, onChangeAmount]);

  useEffect(() => {
    expressionScrollRef.current?.scrollTo({
      left: expressionScrollRef.current.scrollWidth,
    });
    resultScrollRef.current?.scrollTo({
      left: resultScrollRef.current.scrollWidth,
    });
  }, [expression, result]);

  useEffect(
    () => () => {
      if (deleteIntervalRef.current) {
        clearInterval(deleteIntervalRef.current);
      }
    },
    [],
  );

  const appendNumber = (number: number) => {
    setExpression((current) => {
      if (current === "0") return String(number);
      if (/(^|[+\-×÷])0$/.test(current)) {
        return `${current.slice(0, -1)}${number}`;
      }
      return `${current}${number}`;
    });
  };

  const appendOperator = (operator: Operator) => {
    setExpression((current) =>
      trailingOperatorPattern.test(current)
        ? `${current.slice(0, -1)}${operator}`
        : `${current}${operator}`,
    );
  };

  const deleteLastCharacter = () => {
    setExpression((current) =>
      current.length <= 1 ? "0" : current.slice(0, -1),
    );
  };

  const stopDeleting = () => {
    if (!deleteIntervalRef.current) return;

    clearInterval(deleteIntervalRef.current);
    deleteIntervalRef.current = null;
  };

  const startDeleting = () => {
    stopDeleting();
    deleteLastCharacter();
    deleteIntervalRef.current = setInterval(deleteLastCharacter, 250);
  };

  return (
    <section aria-label="결제 금액 계산기" className={classes.root}>
      <div className={classes.display}>
        <div className={classes.valueScroll} ref={expressionScrollRef}>
          <PKText as="p" className={classes.expression} weight={200}>
            {formatExpression(expression)}
          </PKText>
        </div>
        <div className={classes.valueScroll} ref={resultScrollRef}>
          <PKText as="p" className={classes.result} weight={500}>
            {addCommasToNumber(result)}
          </PKText>
        </div>
      </div>

      <div className={classes.keypad}>
        <NumberButton number={7} onClick={appendNumber} />
        <NumberButton number={8} onClick={appendNumber} />
        <NumberButton number={9} onClick={appendNumber} />
        <OperatorButton
          icon={iconMultiply}
          label="곱하기"
          onClick={() => appendOperator("×")}
        />

        <NumberButton number={4} onClick={appendNumber} />
        <NumberButton number={5} onClick={appendNumber} />
        <NumberButton number={6} onClick={appendNumber} />
        <OperatorButton
          icon={iconDivide}
          label="나누기"
          onClick={() => appendOperator("÷")}
        />

        <NumberButton number={1} onClick={appendNumber} />
        <NumberButton number={2} onClick={appendNumber} />
        <NumberButton number={3} onClick={appendNumber} />
        <OperatorButton
          icon={iconPlus}
          label="더하기"
          onClick={() => appendOperator("+")}
        />

        <OperatorButton label="전체 지우기" onClick={() => setExpression("0")}>
          AC
        </OperatorButton>
        <NumberButton number={0} onClick={appendNumber} />
        <PKButton
          activeOpacity={0.2}
          aria-label="한 글자 지우기"
          className={classes.operatorButton}
          colorType="primary"
          onClick={(event) => {
            if (event.detail === 0) deleteLastCharacter();
          }}
          onPointerCancel={stopDeleting}
          onPointerDown={startDeleting}
          onPointerLeave={stopDeleting}
          onPointerUp={stopDeleting}
          type="standard"
          title={
            <span className={classes.clearIconWrap}>
              <img alt="" className={classes.clearIcon} src={iconClear} />
              <img alt="" className={classes.clearXIcon} src={iconClearX} />
            </span>
          }
        />
        <OperatorButton
          icon={iconMinus}
          label="빼기"
          onClick={() => appendOperator("-")}
        />
      </div>
    </section>
  );
}

function NumberButton({
  number,
  onClick,
}: {
  number: number;
  onClick: (number: number) => void;
}) {
  return (
    <PKButton
      activeOpacity={0.2}
      className={classes.numberButton}
      colorType="disable"
      onPress={() => onClick(number)}
      numberOfLines={1}
      textClassName={classes.numberButtonText}
      title={String(number)}
      type="standard"
    />
  );
}

function OperatorButton({
  children,
  icon,
  label,
  onClick,
}: {
  children?: string;
  icon?: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <PKButton
      activeOpacity={0.2}
      aria-label={label}
      className={classes.operatorButton}
      colorType="primary"
      onPress={onClick}
      textClassName={classes.operatorButtonText}
      type="standard"
      title={
        icon ? (
          <img alt="" className={classes.operatorIcon} src={icon} />
        ) : (
          children
        )
      }
    />
  );
}

const classes = {
  root: "grid w-full gap-5",
  display: "grid min-w-0 justify-items-end gap-2",
  valueScroll:
    "w-full overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
  expression:
    "m-0 w-max min-w-full whitespace-nowrap text-right text-[20px] leading-6 text-[#8b9099]",
  result:
    "m-0 w-max min-w-full whitespace-nowrap text-right text-[50px] leading-[1.16] text-[#191919]",
  keypad: "grid w-full grid-cols-4 gap-2",
  numberButton:
    "aspect-square !h-auto min-w-0 !rounded-full !bg-[#e7e9ee] !p-0 text-[#191919]",
  numberButtonText: "!text-[24px] font-semibold leading-none !text-[#191919]",
  operatorButton:
    "relative aspect-square !h-auto min-w-0 !rounded-full !bg-[#dbe8ff] !p-0 text-[#145ed9]",
  operatorButtonText:
    "inline-flex items-center justify-center text-[24px] font-semibold leading-none text-[#145ed9]",
  operatorIcon: "h-6 w-6 object-contain",
  clearIconWrap:
    "relative inline-flex h-6 w-[37px] items-center justify-center",
  clearIcon: "h-6 w-[37px]",
  clearXIcon: "absolute right-[7px] top-[5px] h-[14px] w-[14px]",
};
