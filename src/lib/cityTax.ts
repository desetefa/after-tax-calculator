import cityTaxRates from '../data/cityTaxRates.json'
import type { FilingStatus } from '../App'

type CityRates = Record<
  string,
  {
    state: string
    name: string
    rate?: number
    brackets?: { single: { max: number; rate: number }[]; married: { max: number; rate: number }[] }
  }
>

const rates = cityTaxRates as CityRates

export function getCityTax(
  taxableIncome: number,
  cityId: string,
  filingStatus: FilingStatus
): number {
  if (!cityId || taxableIncome <= 0) return 0
  const city = rates[cityId]
  if (!city) return 0
  if (city.rate !== undefined) {
    if (city.rate === 0) return 0
    return Math.round(taxableIncome * (city.rate / 100) * 100) / 100
  }
  const list = city.brackets?.[filingStatus] ?? city.brackets?.single
  if (!list) return 0
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

export function getCitiesByState(stateCode: string): { id: string; name: string }[] {
  if (!stateCode) return []
  return Object.entries(rates)
    .filter(([, c]) => c.state === stateCode && (c.rate === undefined || c.rate > 0))
    .map(([id, c]) => ({ id, name: c.name }))
    .sort((a, b) => a.name.localeCompare(b.name))
}

/** All major cities with local tax (for comparison list). */
export function getAllMajorCities(): { id: string; name: string; state: string }[] {
  return Object.entries(rates)
    .filter(([, c]) => (c.rate === undefined || c.rate > 0))
    .map(([id, c]) => ({ id, name: c.name, state: c.state }))
    .sort((a, b) => a.name.localeCompare(b.name))
}

export function getCityName(cityId: string): string | null {
  return rates[cityId]?.name ?? null
}

const formatWhole = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n)

/**
 * Helper text for the City row: bracket breakdown (e.g. NYC) or "Amount at X%" for flat rate.
 */
export function getCityTaxHelper(
  cityId: string,
  taxableIncome: number,
  filingStatus: FilingStatus
): string | null {
  if (!cityId || taxableIncome <= 0) return null
  const city = rates[cityId]
  if (!city) return null
  if (city.rate !== undefined) {
    if (city.rate === 0) return null
    return `${formatWhole(taxableIncome)} at ${city.rate}%`
  }
  const list = city.brackets?.[filingStatus] ?? city.brackets?.single
  if (!list) return null
  let prev = 0
  const parts: string[] = []
  for (const { max, rate } of list) {
    const chunk = Math.min(taxableIncome, max) - prev
    if (chunk > 0) parts.push(`${formatWhole(chunk)} at ${rate}%`)
    if (taxableIncome <= max) break
    prev = max
  }
  return parts.join(', ')
}
