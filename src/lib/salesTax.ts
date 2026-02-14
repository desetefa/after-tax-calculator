import salesTaxByState from '../data/salesTaxByState.json'

const rates = salesTaxByState as Record<string, number>

export function getSalesTaxRate(stateCode: string): number | null {
  if (!stateCode) return null
  const rate = rates[stateCode]
  return rate != null ? rate : null
}

export function getSalesTax(purchaseAmount: number, stateCode: string): number {
  if (!stateCode || purchaseAmount <= 0) return 0
  const rate = getSalesTaxRate(stateCode)
  if (rate == null) return 0
  return Math.round(purchaseAmount * (rate / 100) * 100) / 100
}
