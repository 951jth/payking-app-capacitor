import { LoaderCircle } from "lucide-react";
import type {
  ButtonHTMLAttributes,
  CSSProperties,
  PointerEventHandler,
  ReactNode,
} from "react";
import { useRef } from "react";

type ButtonType = "text" | "standard" | "rounded" | "outline" | "custom";
type HtmlButtonType = "button" | "submit" | "reset";
type ColorType =
  | "primary"
  | "warning"
  | "solid-primary"
  | "solid-red"
  | "disable"
  | "standard";

type PKButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "type" | "title"
> & {
  title?: ReactNode;
  // RN 앱과 동일한 시각 타입 prop이다.
  type?: ButtonType;
  // 기존 웹 호출부와의 하위 호환을 위해 유지한다. type이 함께 있으면 buttonType이 우선한다.
  buttonType?: ButtonType;
  // HTML button의 네이티브 type은 별도로 지정한다.
  htmlType?: HtmlButtonType;
  colorType?: ColorType;
  loading?: boolean;
  icon?: ReactNode;
  textClassName?: string;
  // RN의 textStyle 객체에 대응한다. Tailwind가 필요한 경우 textClassName을 사용한다.
  textStyle?: CSSProperties;
  // RN PKText의 numberOfLines를 CSS line-clamp/overflow로 변환한다.
  numberOfLines?: number;
  // RN TouchableOpacity의 activeOpacity를 CSS 변수로 전달한다.
  activeOpacity?: number;
  // 기존 RN 화면을 쉽게 포팅할 수 있도록 onPress 계열 이름을 유지한다.
  // 웹 표준 onClick/onPointer* props도 함께 사용할 수 있다.
  onPress?: ButtonHTMLAttributes<HTMLButtonElement>["onClick"];
  onPressIn?: PointerEventHandler<HTMLButtonElement>;
  onPressOut?: PointerEventHandler<HTMLButtonElement>;
};

type ResolvedColorType = Exclude<ColorType, "standard">;

function resolveColorType(colorType: ColorType): ResolvedColorType {
  return colorType === "standard" ? "primary" : colorType;
}

function isSolidColorType(colorType: ResolvedColorType) {
  return colorType === "solid-primary" || colorType === "solid-red";
}

export function PKButton({
  title,
  children,
  type = "text",
  buttonType,
  htmlType = "button",
  colorType = "primary",
  loading = false,
  icon,
  className,
  textClassName,
  textStyle,
  numberOfLines = 0,
  activeOpacity = 0.2,
  onPress,
  onPressIn,
  onPressOut,
  onClick,
  onPointerDown,
  onPointerUp,
  onPointerCancel,
  onPointerLeave,
  style,
  disabled,
  ...props
}: PKButtonProps) {
  const pressingRef = useRef(false);
  const resolvedButtonType = buttonType ?? type;
  const isDisabled = Boolean(disabled || loading);
  const resolvedColorType = resolveColorType(colorType);
  const usesFillColor =
    resolvedButtonType === "standard" || resolvedButtonType === "rounded";

  // 앱의 style 배열은 뒤쪽 textStyle이 기본 스타일을 덮어쓴다.
  // 웹에서도 textClassName/textStyle을 기본 label 스타일 뒤에 적용한다.
  const labelClassName =
    resolvedButtonType === "custom"
      ? [classes.customLabel, textClassName].filter(Boolean).join(" ")
      : resolvedButtonType === "text"
        ? [classes.textLabel, textClassName].filter(Boolean).join(" ")
        : [classes.label, textClassName].filter(Boolean).join(" ");
  const isTextTitle =
    typeof title === "string" ||
    typeof title === "number" ||
    (title == null &&
      (typeof children === "string" || typeof children === "number"));

  // RN은 문자열 title만 PKText로 감싸고 ReactNode title은 그대로 렌더링한다.
  // 웹도 아이콘·복합 JSX가 불필요한 span 스타일을 받지 않도록 동일하게 분기한다.
  const labelStyle = {
    ...getLineClampStyle(numberOfLines),
    ...textStyle,
  };
  const buttonStyle = {
    // 앱의 TouchableOpacity activeOpacity를 웹 :active opacity로 흉내 낸다.
    "--pk-press-opacity": activeOpacity,
    ...style,
  } as CSSProperties;

  // RN onPressIn/onPressOut을 Pointer Event로 변환한다.
  const handlePointerDown: PointerEventHandler<HTMLButtonElement> = (event) => {
    pressingRef.current = true;
    onPointerDown?.(event);
    onPressIn?.(event);
  };

  const handlePressOut: PointerEventHandler<HTMLButtonElement> = (event) => {
    if (!pressingRef.current) return;

    pressingRef.current = false;
    onPressOut?.(event);
  };

  return (
    <button
      className={[
        classes.base,
        classes.type[resolvedButtonType],
        usesFillColor && classes.fillColor[resolvedColorType],
        usesFillColor && classes.disabledFill,
        resolvedButtonType === "outline" && classes.outlineColors,
        resolvedButtonType === "outline" &&
          isDisabled &&
          classes.outlineDisabled,
        resolvedButtonType === "text" && classes.textColors,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      disabled={isDisabled}
      onClick={onClick ?? onPress}
      onPointerCancel={(event) => {
        onPointerCancel?.(event);
        handlePressOut(event);
      }}
      onPointerDown={handlePointerDown}
      onPointerLeave={(event) => {
        onPointerLeave?.(event);
        handlePressOut(event);
      }}
      onPointerUp={(event) => {
        onPointerUp?.(event);
        handlePressOut(event);
      }}
      style={buttonStyle}
      type={htmlType}
      {...props}
    >
      {loading ? (
        <LoaderCircle
          className={[
            classes.loader,
            usesFillColor && isSolidColorType(resolvedColorType)
              ? classes.loaderOnSolid
              : classes.loaderDefault,
          ]
            .filter(Boolean)
            .join(" ")}
          size={18}
        />
      ) : (
        <>
          {isTextTitle ? (
            <span className={labelClassName} style={labelStyle}>
              {title ?? children}
            </span>
          ) : (
            (title ?? children)
          )}
          {icon ? <span className={classes.icon}>{icon}</span> : null}
        </>
      )}
    </button>
  );
}

function getLineClampStyle(numberOfLines: number): CSSProperties {
  // RN의 numberOfLines=0은 줄 수 제한 없음이다.
  if (numberOfLines <= 0) return {};

  if (numberOfLines === 1) {
    // 앱의 ellipsizeMode="clip"과 맞추기 위해 말줄임표 없이 자른다.
    return {
      overflow: "hidden",
      textOverflow: "clip",
      whiteSpace: "nowrap",
    };
  }

  return {
    display: "-webkit-box",
    overflow: "hidden",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: numberOfLines,
    whiteSpace: "normal",
  };
}

const classes = {
  base: "inline-flex cursor-pointer select-none items-center justify-center gap-2 border-0 p-0 font-[var(--pk-font-scd)] transition-opacity duration-100 active:opacity-[var(--pk-press-opacity)] disabled:cursor-default disabled:active:opacity-100 [-webkit-tap-highlight-color:transparent]",
  type: {
    text: "h-6 min-h-6 rounded-xl bg-transparent px-0",
    standard: "h-[50px] w-full min-w-0 rounded-2xl px-4",
    rounded: "h-14 w-full min-w-0 rounded-[28px] px-4",
    outline:
      "h-14 w-full min-w-0 rounded-[28px] border bg-white px-4 disabled:bg-white",
    // RN에는 없는 웹 전용 타입이다.
    // 계산기처럼 호출부가 크기·배경을 모두 결정할 때 기본 높이와 색상을 강제하지 않는다.
    custom: "",
  },
  fillColor: {
    primary: "bg-[#dbe8ff] text-[#145ed9]",
    warning: "bg-[#fedbdb] text-[#e22c17]",
    "solid-primary": "bg-[#145ed9] text-white",
    "solid-red": "bg-[#e22c17] text-white",
    disable: "bg-[#e7e9ee] text-[#8b9099]",
  },
  disabledFill: "disabled:!bg-[#e7e9ee] disabled:!text-[#8b9099]",
  outlineColors: "border-[#145ed9] text-[#145ed9]",
  outlineDisabled: "disabled:border-[#e7e9ee] disabled:text-[#8b9099]",
  textColors: "text-[#8b9099]",
  label:
    "overflow-hidden text-ellipsis whitespace-nowrap text-base font-semibold leading-none text-inherit",
  textLabel:
    "overflow-hidden text-ellipsis whitespace-nowrap text-xs font-normal leading-3 text-inherit",
  customLabel: "inline-flex items-center justify-center text-inherit",
  icon: "inline-flex items-center justify-center",
  loader: "animate-spin",
  loaderOnSolid: "text-white",
  loaderDefault: "text-[#145ed9]",
};
