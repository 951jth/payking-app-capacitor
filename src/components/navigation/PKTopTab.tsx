import type { KeyboardEvent, ReactNode } from "react";
import { useId, useRef } from "react";
import { pressableClassName } from "../../utils/pressable";

export type PKTopTabItem<Name extends string = string> = {
  name: Name;
  title: string;
  content: ReactNode;
};

type PKTopTabProps<Name extends string> = {
  activeName: Name;
  ariaLabel: string;
  items: PKTopTabItem<Name>[];
  onChange: (name: Name) => void;
  className?: string;
  panelClassName?: string;
};

export function PKTopTab<Name extends string>({
  activeName,
  ariaLabel,
  items,
  onChange,
  className,
  panelClassName,
}: PKTopTabProps<Name>) {
  const idPrefix = useId();
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const activeItem = items.find((item) => item.name === activeName) ?? items[0];

  const selectTab = (index: number) => {
    const item = items[index];
    if (!item) return;

    onChange(item.name);
    tabRefs.current[index]?.focus();
  };

  const handleKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    let nextIndex: number | undefined;

    if (event.key === "ArrowRight") {
      nextIndex = (index + 1) % items.length;
    } else if (event.key === "ArrowLeft") {
      nextIndex = (index - 1 + items.length) % items.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = items.length - 1;
    }

    if (nextIndex == null) return;

    event.preventDefault();
    selectTab(nextIndex);
  };

  if (!activeItem) return null;

  return (
    <div className={[classes.root, className].filter(Boolean).join(" ")}>
      <div aria-label={ariaLabel} className={classes.tabList} role="tablist">
        {items.map((item, index) => {
          const active = activeName === item.name;
          const panelId = `${idPrefix}-${item.name}-panel`;
          const tabId = `${idPrefix}-${item.name}-tab`;

          return (
            <button
              aria-controls={panelId}
              aria-selected={active}
              className={[
                classes.tab,
                active ? classes.tabActive : classes.tabInactive,
              ].join(" ")}
              id={tabId}
              key={item.name}
              onClick={() => onChange(item.name)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              ref={(element) => {
                tabRefs.current[index] = element;
              }}
              role="tab"
              tabIndex={active ? 0 : -1}
              type="button"
            >
              {item.title}
            </button>
          );
        })}
      </div>

      {items.map((item) => {
        const active = activeName === item.name;
        const tabId = `${idPrefix}-${item.name}-tab`;
        const panelId = `${idPrefix}-${item.name}-panel`;

        return (
          <section
            aria-labelledby={tabId}
            className={[
              classes.panel,
              !active && classes.panelHidden,
              panelClassName,
            ]
              .filter(Boolean)
              .join(" ")}
            hidden={!active}
            id={panelId}
            key={item.name}
            role="tabpanel"
          >
            {item.content}
          </section>
        );
      })}
    </div>
  );
}

const classes = {
  root: "flex min-h-0 flex-1 flex-col",
  tabList:
    "mx-5 flex h-[42px] shrink-0 border-b-2 border-solid border-[#e7e9ee]",
  tab: `relative flex min-w-0 flex-1 items-center justify-center border-0 bg-transparent pb-2 pt-0 font-[var(--pk-font-scd)] text-[16px] font-medium ${pressableClassName}`,
  tabActive:
    "text-[#145ed9] after:absolute after:-bottom-0.5 after:left-0 after:h-0.5 after:w-full after:bg-[#145ed9] after:content-['']",
  tabInactive: "text-[#c7ced9]",
  panel: "min-h-0 flex-1",
  panelHidden: "hidden",
};
