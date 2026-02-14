import {
  RENT_BY_LOCATION,
  RENT_SOURCE_URL_BY_LOCATION,
  GROCERIES_MONTHLY_BY_LOCATION,
  TYPICAL_CAR_PAYMENT_MONTHLY,
  TYPICAL_HEALTH_PREMIUM_MONTHLY,
  RETIREMENT_ASSUMED_ANNUAL_RETURN,
  RETIREMENT_YEARS,
  type RentByLocation,
} from '../data/youCouldHaveBoughtData'

function getRent(stateCode: string, cityId: string): RentByLocation | null {
  if (cityId && stateCode) {
    const key = `${stateCode}_${cityId}`
    if (RENT_BY_LOCATION[key]) return RENT_BY_LOCATION[key]
  }
  if (stateCode && RENT_BY_LOCATION[stateCode]) return RENT_BY_LOCATION[stateCode]
  return RENT_BY_LOCATION['US'] ?? null
}

function getRentSourceUrl(stateCode: string, cityId: string): string | null {
  if (cityId && stateCode) {
    const key = `${stateCode}_${cityId}`
    if (RENT_SOURCE_URL_BY_LOCATION[key]) return RENT_SOURCE_URL_BY_LOCATION[key]
  }
  if (stateCode && RENT_SOURCE_URL_BY_LOCATION[stateCode]) return RENT_SOURCE_URL_BY_LOCATION[stateCode]
  return RENT_SOURCE_URL_BY_LOCATION['US'] ?? null
}

function getGroceriesMonthly(stateCode: string, cityId: string): number {
  if (cityId && stateCode) {
    const key = `${stateCode}_${cityId}`
    if (GROCERIES_MONTHLY_BY_LOCATION[key] != null) return GROCERIES_MONTHLY_BY_LOCATION[key]
  }
  if (stateCode && GROCERIES_MONTHLY_BY_LOCATION[stateCode] != null) {
    return GROCERIES_MONTHLY_BY_LOCATION[stateCode]
  }
  return GROCERIES_MONTHLY_BY_LOCATION['US'] ?? 1_080
}

export interface YouCouldHaveBoughtResult {
  /** Months of rent: studio, 1br, 2br (location-specific). */
  rentMonths: { studio: number; oneBr: number; twoBr: number } | null
  /** Monthly rent in dollars (studio, 1br, 2br) for display. */
  rentMonthly: { studio: number; oneBr: number; twoBr: number } | null
  rentLabel: string
  /** Zillow (or similar) URL for median rent in this location. */
  rentSourceUrl: string | null
  /** Future value if tax amount invested at assumed return for RETIREMENT_YEARS. */
  retirementFutureValue: number
  /** Number of months of car payments. */
  carPaymentMonths: number
  /** Number of months of health insurance. */
  healthMonths: number
  /** Years of groceries (tax / (monthly * 12)). */
  groceriesYears: number
  groceriesMonthly: number
}

/**
 * Compute "you could have bought" stats for a given tax amount and location.
 */
export function getYouCouldHaveBought(
  totalTax: number,
  stateCode: string,
  cityId: string
): YouCouldHaveBoughtResult | null {
  if (totalTax <= 0) return null
  const rent = getRent(stateCode || '', cityId || '')
  const groceriesMonthly = getGroceriesMonthly(stateCode || '', cityId || '')
  const retirementFutureValue =
    totalTax * Math.pow(1 + RETIREMENT_ASSUMED_ANNUAL_RETURN, RETIREMENT_YEARS)
  const carPaymentMonths = totalTax / TYPICAL_CAR_PAYMENT_MONTHLY
  const healthMonths = totalTax / TYPICAL_HEALTH_PREMIUM_MONTHLY
  const groceriesYears = totalTax / (groceriesMonthly * 12)

  return {
    rentMonths: rent
      ? {
          studio: totalTax / rent.studio,
          oneBr: totalTax / rent.oneBr,
          twoBr: totalTax / rent.twoBr,
        }
      : null,
    rentMonthly: rent ? { studio: rent.studio, oneBr: rent.oneBr, twoBr: rent.twoBr } : null,
    rentLabel: rent?.label ?? 'U.S.',
    rentSourceUrl: getRentSourceUrl(stateCode || '', cityId || ''),
    retirementFutureValue,
    carPaymentMonths,
    healthMonths,
    groceriesYears,
    groceriesMonthly,
  }
}
