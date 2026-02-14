/**
 * State tax on capital gains. Uses real per-state rules (2024):
 * - No income tax states: no state cap gains tax (except WA which has cap-gains-only tax).
 * - WA: 7% on long-term gains above $250k (standard deduction).
 * - MN: ordinary rates + 1% surcharge on net investment income > $1M.
 * - AZ: 25% of LTCG excluded, rest at ordinary rates.
 * - AR: 50% of LTCG excluded (excess over $10M fully taxed).
 * - NM: greater of $1,000 or 40% of LTCG excluded.
 * - ND: 40% of LTCG excluded.
 * - SC: 44% of LTCG excluded.
 * - WI: 30% deduction on LTCG (taxable = 70% of LTCG).
 * - All others: STCG and LTCG taxed as ordinary income (marginal state tax).
 */
import { getStateTax } from './stateTax'
import stateRates from '../data/stateRates.json'
import type { FilingStatus } from '../App'

const rates = stateRates as Record<
  string,
  { noIncomeTax?: boolean; capitalGainsOnly?: boolean; brackets?: { max: number; rate: number }[] }
>

const WA_CAP_GAINS_THRESHOLD = 250_000
const WA_CAP_GAINS_RATE = 0.07
const AR_LTCG_EXCLUSION_CAP = 10_000_000

export function getStateCapitalGainsTax(
  incomeYearly: number,
  shortTermAmount: number,
  longTermAmount: number,
  stateCode: string,
  filingStatus: FilingStatus
): number {
  if (!stateCode) return 0
  const state = rates[stateCode]
  if (!state) return 0

  const totalCapGains = shortTermAmount + longTermAmount
  if (totalCapGains <= 0) return 0

  // No income tax: no state tax on wages or cap gains (except WA)
  if (state.noIncomeTax) {
    if (state.capitalGainsOnly) {
      // Washington: 7% on LTCG above $250k only
      const taxableLTCG = Math.max(0, longTermAmount - WA_CAP_GAINS_THRESHOLD)
      return Math.round(taxableLTCG * WA_CAP_GAINS_RATE * 100) / 100
    }
    return 0
  }

  // Capital-gains-only state with no ordinary income tax (WA handled above)
  if (state.capitalGainsOnly) {
    const taxableLTCG = Math.max(0, longTermAmount - WA_CAP_GAINS_THRESHOLD)
    return Math.round(taxableLTCG * WA_CAP_GAINS_RATE * 100) / 100
  }

  if (!state.brackets) return 0

  // Minnesota: ordinary rates on cap gains (1% surcharge on income+cap gains > $1M handled in taxCalculations)
  if (stateCode === 'MN') {
    const taxOnIncomeAndGains = getStateTax(incomeYearly + totalCapGains, stateCode, filingStatus)
    const taxOnIncomeOnly = getStateTax(incomeYearly, stateCode, filingStatus)
    return Math.round((taxOnIncomeAndGains - taxOnIncomeOnly) * 100) / 100
  }

  // Arizona: 25% of LTCG excluded
  if (stateCode === 'AZ') {
    const taxableLTCG = longTermAmount * 0.75
    const taxWithPreference = getStateTax(
      incomeYearly + shortTermAmount + taxableLTCG,
      stateCode,
      filingStatus
    )
    const taxIncomeOnly = getStateTax(incomeYearly, stateCode, filingStatus)
    return Math.round((taxWithPreference - taxIncomeOnly) * 100) / 100
  }

  // Arkansas: 50% of LTCG excluded; gains above $10M fully taxed
  if (stateCode === 'AR') {
    const excludedPortion = Math.min(longTermAmount, AR_LTCG_EXCLUSION_CAP) * 0.5
    const taxableLTCG = longTermAmount - excludedPortion
    const taxWithPreference = getStateTax(
      incomeYearly + shortTermAmount + taxableLTCG,
      stateCode,
      filingStatus
    )
    const taxIncomeOnly = getStateTax(incomeYearly, stateCode, filingStatus)
    return Math.round((taxWithPreference - taxIncomeOnly) * 100) / 100
  }

  // New Mexico: greater of $1,000 or 40% of LTCG excluded
  if (stateCode === 'NM') {
    const excluded = Math.max(1000, longTermAmount * 0.4)
    const taxableLTCG = Math.max(0, longTermAmount - excluded)
    const taxWithPreference = getStateTax(
      incomeYearly + shortTermAmount + taxableLTCG,
      stateCode,
      filingStatus
    )
    const taxIncomeOnly = getStateTax(incomeYearly, stateCode, filingStatus)
    return Math.round((taxWithPreference - taxIncomeOnly) * 100) / 100
  }

  // North Dakota: 40% of LTCG excluded
  if (stateCode === 'ND') {
    const taxableLTCG = longTermAmount * 0.6
    const taxWithPreference = getStateTax(
      incomeYearly + shortTermAmount + taxableLTCG,
      stateCode,
      filingStatus
    )
    const taxIncomeOnly = getStateTax(incomeYearly, stateCode, filingStatus)
    return Math.round((taxWithPreference - taxIncomeOnly) * 100) / 100
  }

  // South Carolina: 44% of LTCG excluded
  if (stateCode === 'SC') {
    const taxableLTCG = longTermAmount * 0.56
    const taxWithPreference = getStateTax(
      incomeYearly + shortTermAmount + taxableLTCG,
      stateCode,
      filingStatus
    )
    const taxIncomeOnly = getStateTax(incomeYearly, stateCode, filingStatus)
    return Math.round((taxWithPreference - taxIncomeOnly) * 100) / 100
  }

  // Wisconsin: 30% deduction on LTCG (70% taxable)
  if (stateCode === 'WI') {
    const taxableLTCG = longTermAmount * 0.7
    const taxWithPreference = getStateTax(
      incomeYearly + shortTermAmount + taxableLTCG,
      stateCode,
      filingStatus
    )
    const taxIncomeOnly = getStateTax(incomeYearly, stateCode, filingStatus)
    return Math.round((taxWithPreference - taxIncomeOnly) * 100) / 100
  }

  // All other states with income tax: STCG and LTCG taxed as ordinary income
  const taxOnIncomeAndGains = getStateTax(incomeYearly + totalCapGains, stateCode, filingStatus)
  const taxOnIncomeOnly = getStateTax(incomeYearly, stateCode, filingStatus)
  return Math.round((taxOnIncomeAndGains - taxOnIncomeOnly) * 100) / 100
}
