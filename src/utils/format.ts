export function formatTelephone(value: string) {
  if (!value) return ''
  const onlyNums = value.replace(/\D/g, '')
  if (onlyNums.length <= 4) return onlyNums
  if (onlyNums.length <= 8) {
    return `${onlyNums.slice(0, 4)}-${onlyNums.slice(4, 8)}`
  }
  if (onlyNums.length <= 9) {
    return `${onlyNums.slice(0, 2)}-${onlyNums.slice(2, 5)}-${onlyNums.slice(5, 9)}`
  }
  if (onlyNums.length <= 10) {
    return `${onlyNums.slice(0, 2)}-${onlyNums.slice(2, 6)}-${onlyNums.slice(6, 10)}`
  }
  if (onlyNums.length <= 11) {
    return `${onlyNums.slice(0, 3)}-${onlyNums.slice(3, 7)}-${onlyNums.slice(7, 11)}`
  }

  return onlyNums
}

export function addCommasToNumber(number: number | string | null | undefined) {
  if (number === 0) return '0'
  if (number == null || number === '') return '0'

  const parts = number.toString().split('.')
  if (parts[0]) {
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }

  return parts.join('.')
}

export function percent(usePrice: number, totalPrice: number, digits = 1) {
  if (!Number.isFinite(usePrice) || !Number.isFinite(totalPrice) || totalPrice <= 0) {
    return 0
  }

  return +((usePrice / totalPrice) * 100).toFixed(digits)
}
