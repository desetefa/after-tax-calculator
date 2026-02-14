import {
  INCOME_TIERS_BY_LOCATION,
  CLASS_THRESHOLDS_SINGLE,
  CLASS_THRESHOLDS_MARRIED,
  type LocationTier,
} from '../data/incomeTierData'
import type { FilingStatus } from '../App'

function getLocationTier(stateCode: string, cityId: string): LocationTier | null {
  if (cityId && stateCode) {
    const cityKey = `${stateCode}_${cityId}`
    if (INCOME_TIERS_BY_LOCATION[cityKey]) return INCOME_TIERS_BY_LOCATION[cityKey]
  }
  if (stateCode && INCOME_TIERS_BY_LOCATION[stateCode]) return INCOME_TIERS_BY_LOCATION[stateCode]
  return INCOME_TIERS_BY_LOCATION['US'] ?? null
}

/** First line: "Below typical NYC income" / "Around typical NYC income" / etc. */
function getTierLine1(yearly: number, tier: LocationTier): string {
  const { label, median, p80, p90 } = tier
  const low = median * 0.7
  const high = median * 1.3
  if (yearly < low) return `Below typical ${label} income`
  if (yearly <= high) return `Around typical ${label} income`
  if (yearly < p80) return `Above typical ${label} income`
  if (yearly < p90) return `Top 20% of ${label} incomes`
  return `Top 10% of ${label} incomes`
}

/** Second line: "Under poverty line" / "Working class" / etc. */
function getTierLine2(yearly: number, filingStatus: FilingStatus): string {
  const t = filingStatus === 'married' ? CLASS_THRESHOLDS_MARRIED : CLASS_THRESHOLDS_SINGLE
  if (yearly < t.poverty) return 'Under poverty line'
  if (yearly < t.workingClass) return 'Working class'
  if (yearly < t.lowerMiddle) return 'Lower middle class'
  if (yearly < t.middle) return 'Middle class'
  if (yearly < t.upperMiddle) return 'Upper middle class'
  return 'Upper class'
}

export interface IncomeTierLines {
  line1: string
  line2: string
  locationLabel: string
}

/**
 * Returns the two helper lines for the W-2 income slider:
 * line1 = location-based (typical / Top 20% / Top 10%), line2 = class label.
 */
export function getIncomeTierLines(
  yearlyIncome: number,
  stateCode: string,
  cityId: string,
  filingStatus: FilingStatus
): IncomeTierLines | null {
  if (yearlyIncome <= 0) return null
  const tier = getLocationTier(stateCode || '', cityId || '')
  if (!tier) return null
  return {
    line1: getTierLine1(yearlyIncome, tier),
    line2: getTierLine2(yearlyIncome, filingStatus),
    locationLabel: tier.label,
  }
}
