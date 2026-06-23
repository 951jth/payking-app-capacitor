import { PKButton } from '../button/PKButton'

export type PKRadioOption<Value extends string = string> = {
  label: string
  value: Value
}

type PKRadioGroupProps<Value extends string> = {
  options: PKRadioOption<Value>[]
  value: Value[] | null
  onChange: (value: Value[] | null) => void
  multiple?: boolean
  useAll?: boolean
  className?: string
}

export function PKRadioGroup<Value extends string>({
  options,
  value,
  onChange,
  multiple = true,
  useAll = false,
  className,
}: PKRadioGroupProps<Value>) {
  const toggleValue = (nextValue: Value) => {
    if (value?.includes(nextValue)) {
      onChange(value.filter((item) => item !== nextValue))
      return
    }

    if (!multiple) {
      onChange([nextValue])
      return
    }

    onChange(value ? [...value, nextValue] : [nextValue])
  }

  return (
    <div className={[classes.group, className].filter(Boolean).join(' ')}>
      {useAll && (
        <PKButton
          buttonType="standard"
          className={classes.optionButton}
          colorType={value == null ? 'primary' : 'disable'}
          onClick={() => onChange(null)}
          textClassName={classes.optionLabel}
          title="전체"
        />
      )}
      {options.map((option) => {
        const isSelected = Boolean(value?.includes(option.value))

        return (
          <PKButton
            buttonType="standard"
            className={classes.optionButton}
            colorType={isSelected ? 'primary' : 'disable'}
            key={option.value}
            onClick={() => toggleValue(option.value)}
            textClassName={classes.optionLabel}
            title={option.label}
          />
        )
      })}
    </div>
  )
}

const classes = {
  group: 'flex flex-row flex-wrap gap-2',
  optionButton:
    '!h-[34px] !min-h-[34px] !w-auto shrink-0 grow-0 basis-auto flex-none rounded-xl !px-4',
  optionLabel: 'text-xs font-medium leading-none',
}
