import type { FilingStatus } from '../App'

// 2025 values (must match fica.ts for wage base and Medicare threshold)
const SOCIAL_SECURITY_WAGE_BASE = 176_100
const SS_RATE_SE = 0.124 // 12.4% (both halves) on SE income
const MEDICARE_RATE_SE = 0.029 // 2.9% (both halves) on SE income
const SE_PROFIT_FACTOR = 0.9235 // 92.35% of net profit is subject to SE tax
const ADDITIONAL_MEDICARE_THRESHOLD_SINGLE = 200_000
const ADDITIONAL_MEDICARE_THRESHOLD_MARRIED = 250_000
const ADDITIONAL_MEDICARE_RATE = 0.009

export interface SelfEmploymentTaxResult {
  socialSecurity: number
  medicare: number
  additionalMedicare: number
  total: number
}

/**
 * Federal self-employment tax (SECA) on business/SE profit.
 * Uses same wage base and Additional Medicare thresholds as FICA.
 * W-2 wages reduce the room left for SS tax on SE income.
 */
export function getSelfEmploymentTax(
  businessIncomeYearly: number,
  wagesYearly: number,
  filingStatus: FilingStatus
): SelfEmploymentTaxResult {
  if (businessIncomeYearly <= 0) {
    return { socialSecurity: 0, medicare: 0, additionalMedicare: 0, total: 0 }
  }
  const seTaxable = businessIncomeYearly * SE_PROFIT_FACTOR

  // SS: only on SE taxable that fits under the wage base (after W-2)
  const ssRoom = Math.max(0, SOCIAL_SECURITY_WAGE_BASE - Math.min(wagesYearly, SOCIAL_SECURITY_WAGE_BASE))
  const ssTaxable = Math.min(seTaxable, ssRoom)
  const socialSecurity = Math.round(ssTaxable * SS_RATE_SE * 100) / 100

  // Medicare: 2.9% on full SE taxable
  const medicare = Math.round(seTaxable * MEDICARE_RATE_SE * 100) / 100

  // Additional Medicare 0.9%: on (wages + SE taxable) over threshold; we only add the incremental from SE
  const threshold =
    filingStatus === 'married' ? ADDITIONAL_MEDICARE_THRESHOLD_MARRIED : ADDITIONAL_MEDICARE_THRESHOLD_SINGLE
  const totalOverThreshold = Math.max(0, wagesYearly + seTaxable - threshold)
  const wagesOverThreshold = Math.max(0, wagesYearly - threshold)
  const seOverThreshold = Math.max(0, totalOverThreshold - wagesOverThreshold)
  const additionalMedicare = Math.round(seOverThreshold * ADDITIONAL_MEDICARE_RATE * 100) / 100

  const total = Math.round((socialSecurity + medicare + additionalMedicare) * 100) / 100
  return { socialSecurity, medicare, additionalMedicare, total }
}

const formatWhole = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

export function getSelfEmploymentTaxHelper(
  businessIncomeYearly: number,
  wagesYearly: number,
  filingStatus: FilingStatus
): string {
  if (businessIncomeYearly <= 0) return '—'
  const seTaxable = businessIncomeYearly * SE_PROFIT_FACTOR
  const parts: string[] = []
  parts.push(`92.35% of profit = ${formatWhole(seTaxable)}`)
  const ssRoom = Math.max(0, SOCIAL_SECURITY_WAGE_BASE - Math.min(wagesYearly, SOCIAL_SECURITY_WAGE_BASE))
  if (ssRoom > 0) {
    const ssTaxable = Math.min(seTaxable, ssRoom)
    parts.push(`SS 12.4% on ${formatWhole(ssTaxable)}`)
  }
  parts.push(`Medicare 2.9% on ${formatWhole(seTaxable)}`)
  const threshold =
    filingStatus === 'married' ? ADDITIONAL_MEDICARE_THRESHOLD_MARRIED : ADDITIONAL_MEDICARE_THRESHOLD_SINGLE
  const totalOver = Math.max(0, wagesYearly + seTaxable - threshold)
  const wagesOver = Math.max(0, wagesYearly - threshold)
  const seOver = Math.max(0, totalOver - wagesOver)
  if (seOver > 0) parts.push(`+0.9% on ${formatWhole(seOver)}`)
  return parts.join('; ')
}
