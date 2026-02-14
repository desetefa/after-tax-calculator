import stateRates from '../data/stateRates.json'

type FilingStatus = 'single' | 'married'

interface StateBracket {
  max: number
  rate: number
}

interface StateRate {
  noIncomeTax?: boolean
  capitalGainsOnly?: boolean
  brackets?: StateBracket[]
}

const rates = stateRates as Record<string, StateRate>

export function getStateTax(
  taxableIncome: number,
  stateCode: string,
  _filingStatus: FilingStatus
): number {
  if (!stateCode || taxableIncome <= 0) return 0
  const state = rates[stateCode]
  if (!state || state.noIncomeTax || state.capitalGainsOnly || !state.brackets) return 0
  let tax = 0
  let prevMax = 0
  for (const { max, rate } of state.brackets) {
    const bracketSize = Math.min(taxableIncome, max) - prevMax
    if (bracketSize > 0) tax += bracketSize * (rate / 100)
    if (taxableIncome <= max) break
    prevMax = max
  }
  return Math.round(tax * 100) / 100
}
