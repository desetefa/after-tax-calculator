import { getFederalTax } from './federalTax'
import type { FilingStatus } from '../App'

export function getLongTermRate(taxableIncome: number, filingStatus: FilingStatus): number {
  if (taxableIncome <= 0) return 0
  const married2024 = [94050, 583750] as const
  const single2024 = [47025, 518900] as const
  const [t1, t2] = filingStatus === 'married' ? married2024 : single2024
  if (taxableIncome <= t1) return 0
  if (taxableIncome <= t2) return 15
  return 20
}

/** Federal tax on long-term gains only (0/15/20%). Used when showing LTCG separately from income. */
export function getFederalLTCGTax(
  incomeYearly: number,
  longTermAmount: number,
  filingStatus: FilingStatus
): number {
  if (longTermAmount <= 0) return 0
  const incomeForLtBracket = incomeYearly + longTermAmount
  const ltRate = getLongTermRate(incomeForLtBracket, filingStatus) / 100
  return Math.round(longTermAmount * ltRate * 100) / 100
}

/**
 * Federal tax on capital gains only. Works with $0 income (stocks-only).
 * Short-term: marginal ordinary income tax. Long-term: 0/15/20% by bracket (bracket = income + LTCG).
 */
export function getCapitalGainsTax(
  stocksAmount: number,
  shortTermPercent: number,
  totalYearlyIncome: number,
  filingStatus: FilingStatus,
  _stateCode: string
): number {
  if (stocksAmount <= 0) return 0
  const pct = Math.max(0, Math.min(100, shortTermPercent)) / 100
  const shortTermAmount = stocksAmount * pct
  const longTermAmount = stocksAmount * (1 - pct)

  // Short-term: marginal federal tax (works when totalYearlyIncome is 0)
  const federalShort = shortTermAmount > 0
    ? getFederalTax(totalYearlyIncome + shortTermAmount, filingStatus) -
      getFederalTax(totalYearlyIncome, filingStatus)
    : 0

  // Long-term: bracket based on income + LTCG (so $0 income still gets correct 0/15/20% rate)
  const incomeForLtBracket = totalYearlyIncome + longTermAmount
  const ltRate = getLongTermRate(incomeForLtBracket, filingStatus) / 100
  const federalLong = longTermAmount * ltRate

  return Math.round((federalShort + federalLong) * 100) / 100
}
