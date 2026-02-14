import type { FilingStatus } from '../App'

// 2025 values
const SOCIAL_SECURITY_RATE = 0.062
const SOCIAL_SECURITY_WAGE_BASE = 176_100
const MEDICARE_RATE = 0.0145
const ADDITIONAL_MEDICARE_THRESHOLD_SINGLE = 200_000
const ADDITIONAL_MEDICARE_THRESHOLD_MARRIED = 250_000
const ADDITIONAL_MEDICARE_RATE = 0.009

export interface FicaResult {
  socialSecurity: number
  medicare: number
  additionalMedicare: number
  total: number
}

/**
 * FICA applies to wages/salary (earned income), not investment income.
 * - Social Security: 6.2% on wages up to wage base.
 * - Medicare: 1.45% on all wages; additional 0.9% on wages over threshold (single/married).
 */
export function getFica(wages: number, filingStatus: FilingStatus): FicaResult {
  if (wages <= 0) {
    return { socialSecurity: 0, medicare: 0, additionalMedicare: 0, total: 0 }
  }
  const ssTaxable = Math.min(wages, SOCIAL_SECURITY_WAGE_BASE)
  const socialSecurity = Math.round(ssTaxable * SOCIAL_SECURITY_RATE * 100) / 100
  const medicare = Math.round(wages * MEDICARE_RATE * 100) / 100
  const threshold =
    filingStatus === 'married' ? ADDITIONAL_MEDICARE_THRESHOLD_MARRIED : ADDITIONAL_MEDICARE_THRESHOLD_SINGLE
  const amtOver = Math.max(0, wages - threshold)
  const additionalMedicare = Math.round(amtOver * ADDITIONAL_MEDICARE_RATE * 100) / 100
  const total = Math.round((socialSecurity + medicare + additionalMedicare) * 100) / 100
  return { socialSecurity, medicare, additionalMedicare, total }
}

const formatWhole = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

export function getFicaHelper(wages: number, filingStatus: FilingStatus): string {
  if (wages <= 0) return '—'
  const parts: string[] = []
  const ssTaxable = Math.min(wages, SOCIAL_SECURITY_WAGE_BASE)
  parts.push(`SS ${(SOCIAL_SECURITY_RATE * 100).toFixed(1)}% on ${formatWhole(ssTaxable)}`)
  parts.push(`Medicare ${(MEDICARE_RATE * 100).toFixed(2)}% on ${formatWhole(wages)}`)
  const threshold =
    filingStatus === 'married' ? ADDITIONAL_MEDICARE_THRESHOLD_MARRIED : ADDITIONAL_MEDICARE_THRESHOLD_SINGLE
  if (wages > threshold) {
    const over = wages - threshold
    parts.push(`+${(ADDITIONAL_MEDICARE_RATE * 100).toFixed(1)}% on ${formatWhole(over)}`)
  }
  return parts.join('; ')
}
