import type { InputHTMLAttributes, ReactNode } from 'react'
import { useMemo, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { pressableClassName } from '../../utils/pressable'

type PKInputType =
  | 'text'
  | 'id'
  | 'password'
  | 'phoneNumber'
  | 'telephone'
  | 'businessNumber'
  | 'price'
  | 'rate'
  | 'commission'

type PKInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'value' | 'onChange'
> & {
  type?: PKInputType
  value?: string
  onChangeText?: (value: string) => void
  postButton?: ReactNode
  wrapperClassName?: string
}

function onlyDigits(value: string) {
  return value.replace(/\D/g, '')
}

function formatPhoneNumber(value: string) {
  const nums = onlyDigits(value)
  if (nums.length <= 3) return nums
  if (nums.length <= 7) return `${nums.slice(0, 3)}-${nums.slice(3)}`
  return `${nums.slice(0, 3)}-${nums.slice(3, 7)}-${nums.slice(7, 11)}`
}

function formatBusinessNumber(value: string) {
  const nums = onlyDigits(value)
  if (nums.length <= 3) return nums
  if (nums.length <= 5) return `${nums.slice(0, 3)}-${nums.slice(3)}`
  return `${nums.slice(0, 3)}-${nums.slice(3, 5)}-${nums.slice(5, 10)}`
}

function addCommas(value: string) {
  const nums = onlyDigits(value)
  return nums.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export function PKInput({
  type = 'text',
  value = '',
  onChangeText,
  postButton,
  wrapperClassName,
  disabled,
  className,
  placeholder,
  ...props
}: PKInputProps) {
  const [focused, setFocused] = useState(false)
  const [visible, setVisible] = useState(false)
  const isPassword = type === 'password'

  const formattedValue = useMemo(() => {
    if (type === 'phoneNumber') return formatPhoneNumber(value)
    if (type === 'telephone') return formatPhoneNumber(value)
    if (type === 'businessNumber') return formatBusinessNumber(value)
    if (type === 'price') return addCommas(value)
    return value
  }, [type, value])

  const handleChange = (nextValue: string) => {
    if (type === 'id' || type === 'password') {
      onChangeText?.(nextValue.replace(/[ㄱ-ㅎㅏ-ㅣ가-힣\s]/g, ''))
      return
    }

    if (
      type === 'phoneNumber' ||
      type === 'telephone' ||
      type === 'businessNumber' ||
      type === 'price' ||
      type === 'rate'
    ) {
      onChangeText?.(onlyDigits(nextValue))
      return
    }

    if (type === 'commission') {
      const sanitized = nextValue
        .replace(/[^0-9.]/g, '')
        .replace(/^0+(?=\d)/, '')
      const [integer = '', decimal = ''] = sanitized.split('.')
      const normalized =
        sanitized.includes('.') ? `${integer || '0'}.${decimal.slice(0, 2)}` : integer
      onChangeText?.(Number(normalized) > 100 ? '100' : normalized)
      return
    }

    onChangeText?.(nextValue)
  }

  return (
    <label
      className={[
        classes.wrapper,
        focused && classes.wrapperFocused,
        disabled && classes.wrapperDisabled,
        wrapperClassName,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <input
        className={[classes.control, className].filter(Boolean).join(' ')}
        disabled={disabled}
        inputMode={
          ['phoneNumber', 'telephone', 'businessNumber', 'price', 'rate'].includes(type)
            ? 'numeric'
            : undefined
        }
        onBlur={() => setFocused(false)}
        onChange={(event) => handleChange(event.target.value)}
        onFocus={() => setFocused(true)}
        placeholder={placeholder}
        type={isPassword && !visible ? 'password' : 'text'}
        value={formattedValue}
        {...props}
      />
      {isPassword && (
        <button
          aria-label={visible ? '비밀번호 숨기기' : '비밀번호 보기'}
          className={classes.iconButton}
          onClick={() => setVisible((prev) => !prev)}
          type="button"
        >
          {visible ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      )}
      {postButton}
    </label>
  )
}

const classes = {
  wrapper:
    'relative box-border flex h-12 items-center border-b border-[#f1f2f4] px-2 pl-1',
  wrapperFocused: 'border-b-[var(--pk-primary)]',
  wrapperDisabled: 'text-[var(--pk-muted)]',
  control:
    'h-full min-w-0 flex-1 border-0 bg-transparent p-0 font-[var(--pk-font-ptd)] text-sm font-medium text-[#1e1e1e] outline-none placeholder:text-[#cad0da]',
  iconButton:
    `inline-flex h-8 w-8 items-center justify-center border-0 bg-transparent text-[#99a2b0] ${pressableClassName}`,
}
