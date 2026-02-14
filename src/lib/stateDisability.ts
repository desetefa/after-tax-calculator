import stateDisabilityRates from '../data/stateDisabilityRates.json'

type Rates = Record<
  string,
  { name: string; rate: number; wageBase: number | null; maxWithholding: number | null }
>
const rates = stateDisabilityRates as Rates

export function getStateDisability(wages: number, stateCode: string): number {
  if (!stateCode || wages <= 0) return 0
  const s = rates[stateCode]
  if (!s) return 0
  const taxable = s.wageBase != null ? Math.min(wages, s.wageBase) : wages
  let amount = Math.round(taxable * (s.rate / 100) * 100) / 100
  if (s.maxWithholding != null && amount > s.maxWithholding) {
    amount = s.maxWithholding
  }
  return amount
}

const formatWhole = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

export function getStateDisabilityHelper(wages: number, stateCode: string): string | null {
  if (!stateCode || wages <= 0) return null
  const s = rates[stateCode]
  if (!s) return null
  const taxable = s.wageBase != null ? Math.min(wages, s.wageBase) : wages
  if (s.maxWithholding != null) {
    return `${formatWhole(taxable)} at ${s.rate}% (max ${formatWhole(s.maxWithholding)})`
  }
  return `${formatWhole(wages)} at ${s.rate}%`
}

export function getStateDisabilityName(stateCode: string): string | null {
  return rates[stateCode]?.name ?? null
}
