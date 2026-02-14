import federalBrackets from '../data/federalBrackets.json'

type FilingStatus = 'single' | 'married'

const brackets = federalBrackets as {
  single: { max: number; rate: number }[]
  married: { max: number; rate: number }[]
}

function getBracketList(status: FilingStatus) {
  return status === 'married' ? brackets.married : brackets.single
}

export function getFederalTax(taxableIncome: number, filingStatus: FilingStatus): number {
  if (taxableIncome <= 0) return 0
  const list = getBracketList(filingStatus)
  let tax = 0
  let prevMax = 0
  for (const { max, rate } of list) {
    const bracketSize = Math.min(taxableIncome, max) - prevMax
    if (bracketSize > 0) tax += bracketSize * (rate / 100)
    if (taxableIncome <= max) break
    prevMax = max
  }
  return Math.round(tax * 100) / 100
}
