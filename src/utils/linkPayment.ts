import { addCommasToNumber } from './format'
import type { LinkPaymentGoods } from '../types/linkPayment'

export function selectGoodsTotalName(selectedGoods: LinkPaymentGoods[] | null | undefined) {
  if (!selectedGoods?.length) return ''

  const firstName = selectedGoods[0]?.name ?? ''
  const etcCount = selectedGoods.length - 1
  const suffix = ` 외 ${etcCount}건`
  const result = selectedGoods.length > 1 ? `${firstName}${suffix}` : firstName

  if (result.length <= 50) return result
  if (selectedGoods.length <= 1) return `${firstName.slice(0, 47)}...`

  const maxFirstLength = Math.max(0, 50 - suffix.length - 3)
  return `${firstName.slice(0, maxFirstLength)}...${suffix}`
}

export function calculateTotalPrice(
  selectedGoods: LinkPaymentGoods[] | null | undefined,
  useComma: true,
): string
export function calculateTotalPrice(
  selectedGoods: LinkPaymentGoods[] | null | undefined,
  useComma?: false,
): number
export function calculateTotalPrice(
  selectedGoods: LinkPaymentGoods[] | null | undefined,
  useComma = false,
) {
  const totalPrice =
    selectedGoods?.reduce((sum, item) => {
      const price = Number(item.price) || 0
      const count = Number(item.count) || 0
      return sum + price * count
    }, 0) ?? 0

  return useComma ? addCommasToNumber(totalPrice) : totalPrice
}

export function calculateTotalPriceByTaxType(
  selectedGoods: LinkPaymentGoods[] | null | undefined,
  useComma: true,
): { taxPayAmount: string; freePayAmount: string }
export function calculateTotalPriceByTaxType(
  selectedGoods: LinkPaymentGoods[] | null | undefined,
  useComma?: false,
): { taxPayAmount: number; freePayAmount: number }
export function calculateTotalPriceByTaxType(
  selectedGoods: LinkPaymentGoods[] | null | undefined,
  useComma = false,
) {
  let taxPayAmount = 0
  let freePayAmount = 0

  selectedGoods?.forEach((item) => {
    const total = (Number(item.price) || 0) * (Number(item.count) || 0)

    if (item.taxType === 'TAX') {
      taxPayAmount += total
      return
    }

    if (item.taxType === 'FREE') {
      freePayAmount += total
    }
  })

  if (useComma) {
    return {
      taxPayAmount: addCommasToNumber(taxPayAmount),
      freePayAmount: addCommasToNumber(freePayAmount),
    }
  }

  return { taxPayAmount, freePayAmount }
}
