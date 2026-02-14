/**
 * Data for "You could have bought" column: rent, groceries by location;
 * national defaults for car payment, health insurance, retirement assumption.
 * Sources cited on Tax brackets & sources page.
 */

/** Monthly rent by unit type. Key: stateCode or "stateCode_cityId". */
export interface RentByLocation {
  studio: number
  oneBr: number
  twoBr: number
  /** Display name (e.g. "NYC", "California"). */
  label: string
}

export const RENT_BY_LOCATION: Record<string, RentByLocation> = {
  US: { studio: 1_340, oneBr: 1_587, twoBr: 1_889, label: 'U.S.' },
  NY: { studio: 2_200, oneBr: 2_800, twoBr: 3_400, label: 'New York' },
  NY_NYC: { studio: 3_200, oneBr: 3_910, twoBr: 4_510, label: 'NYC' },
  NY_Yonkers: { studio: 1_900, oneBr: 2_200, twoBr: 2_600, label: 'Yonkers' },
  CA: { studio: 1_950, oneBr: 2_350, twoBr: 2_950, label: 'California' },
  TX: { studio: 1_150, oneBr: 1_350, twoBr: 1_650, label: 'Texas' },
  FL: { studio: 1_500, oneBr: 1_750, twoBr: 2_150, label: 'Florida' },
  PA: { studio: 1_150, oneBr: 1_350, twoBr: 1_600, label: 'Pennsylvania' },
  PA_Philadelphia: { studio: 1_350, oneBr: 1_550, twoBr: 1_850, label: 'Philadelphia' },
  OH: { studio: 950, oneBr: 1_150, twoBr: 1_400, label: 'Ohio' },
  OH_Cleveland: { studio: 950, oneBr: 1_100, twoBr: 1_350, label: 'Cleveland' },
  OH_Columbus: { studio: 1_050, oneBr: 1_250, twoBr: 1_500, label: 'Columbus' },
  MI: { studio: 1_050, oneBr: 1_250, twoBr: 1_500, label: 'Michigan' },
  MI_Detroit: { studio: 950, oneBr: 1_100, twoBr: 1_350, label: 'Detroit' },
  NJ: { studio: 1_750, oneBr: 2_100, twoBr: 2_500, label: 'New Jersey' },
  IL: { studio: 1_450, oneBr: 1_750, twoBr: 2_150, label: 'Illinois' },
  MA: { studio: 2_400, oneBr: 2_800, twoBr: 3_300, label: 'Massachusetts' },
  WA: { studio: 1_650, oneBr: 2_000, twoBr: 2_500, label: 'Washington' },
  CO: { studio: 1_550, oneBr: 1_850, twoBr: 2_300, label: 'Colorado' },
  GA: { studio: 1_350, oneBr: 1_550, twoBr: 1_850, label: 'Georgia' },
  NC: { studio: 1_250, oneBr: 1_450, twoBr: 1_750, label: 'North Carolina' },
  VA: { studio: 1_550, oneBr: 1_850, twoBr: 2_250, label: 'Virginia' },
  AZ: { studio: 1_250, oneBr: 1_450, twoBr: 1_750, label: 'Arizona' },
  TN: { studio: 1_250, oneBr: 1_450, twoBr: 1_750, label: 'Tennessee' },
  IN: { studio: 950, oneBr: 1_150, twoBr: 1_400, label: 'Indiana' },
  MO: { studio: 1_050, oneBr: 1_250, twoBr: 1_500, label: 'Missouri' },
  MD: { studio: 1_550, oneBr: 1_850, twoBr: 2_250, label: 'Maryland' },
  MN: { studio: 1_250, oneBr: 1_500, twoBr: 1_850, label: 'Minnesota' },
  WI: { studio: 1_050, oneBr: 1_250, twoBr: 1_500, label: 'Wisconsin' },
  DC: { studio: 1_850, oneBr: 2_200, twoBr: 2_940, label: 'D.C.' },
}

/** Zillow rental market trends URL for each location (median rent source). Key: stateCode or "stateCode_cityId". */
export const RENT_SOURCE_URL_BY_LOCATION: Record<string, string> = {
  US: 'https://www.zillow.com/rental-manager/market-trends/',
  NY: 'https://www.zillow.com/rental-manager/market-trends/ny/',
  NY_NYC: 'https://www.zillow.com/rental-manager/market-trends/new-york-ny/',
  NY_Yonkers: 'https://www.zillow.com/rental-manager/market-trends/yonkers-ny/',
  CA: 'https://www.zillow.com/rental-manager/market-trends/ca/',
  TX: 'https://www.zillow.com/rental-manager/market-trends/tx/',
  FL: 'https://www.zillow.com/rental-manager/market-trends/fl/',
  PA: 'https://www.zillow.com/rental-manager/market-trends/pa/',
  PA_Philadelphia: 'https://www.zillow.com/rental-manager/market-trends/philadelphia-pa/',
  OH: 'https://www.zillow.com/rental-manager/market-trends/oh/',
  OH_Cleveland: 'https://www.zillow.com/rental-manager/market-trends/cleveland-oh/',
  OH_Columbus: 'https://www.zillow.com/rental-manager/market-trends/columbus-oh/',
  MI: 'https://www.zillow.com/rental-manager/market-trends/mi/',
  MI_Detroit: 'https://www.zillow.com/rental-manager/market-trends/detroit-mi/',
  NJ: 'https://www.zillow.com/rental-manager/market-trends/nj/',
  IL: 'https://www.zillow.com/rental-manager/market-trends/il/',
  MA: 'https://www.zillow.com/rental-manager/market-trends/ma/',
  WA: 'https://www.zillow.com/rental-manager/market-trends/wa/',
  CO: 'https://www.zillow.com/rental-manager/market-trends/co/',
  GA: 'https://www.zillow.com/rental-manager/market-trends/ga/',
  NC: 'https://www.zillow.com/rental-manager/market-trends/nc/',
  VA: 'https://www.zillow.com/rental-manager/market-trends/va/',
  AZ: 'https://www.zillow.com/rental-manager/market-trends/az/',
  TN: 'https://www.zillow.com/rental-manager/market-trends/tn/',
  IN: 'https://www.zillow.com/rental-manager/market-trends/in/',
  MO: 'https://www.zillow.com/rental-manager/market-trends/mo/',
  MD: 'https://www.zillow.com/rental-manager/market-trends/md/',
  MN: 'https://www.zillow.com/rental-manager/market-trends/mn/',
  WI: 'https://www.zillow.com/rental-manager/market-trends/wi/',
  DC: 'https://www.zillow.com/rental-manager/market-trends/dc/',
}

/** Average monthly grocery spending. Key: stateCode or "stateCode_cityId"; fallback US. */
export const GROCERIES_MONTHLY_BY_LOCATION: Record<string, number> = {
  US: 1_080,
  HI: 1_336,
  AK: 1_316,
  CA: 1_192,
  NV: 1_180,
  NY: 1_100,
  NJ: 1_120,
  MA: 1_150,
  FL: 1_050,
  TX: 1_020,
  WA: 1_080,
  CO: 1_060,
  AZ: 1_040,
  GA: 1_000,
  NC: 980,
  VA: 1_030,
  OH: 950,
  MI: 960,
  PA: 970,
  IL: 1_020,
  MN: 1_000,
  WI: 960,
  IN: 930,
  MO: 940,
  TN: 920,
  MD: 1_060,
}

/** Typical monthly new-car payment (USA average 2024). Source: industry reports. */
export const TYPICAL_CAR_PAYMENT_MONTHLY = 735

/** Typical individual health insurance premium per month (ACA benchmark 2024). */
export const TYPICAL_HEALTH_PREMIUM_MONTHLY = 477

/** Assumed real annual return for retirement (e.g. 401k/Roth IRA long-term). */
export const RETIREMENT_ASSUMED_ANNUAL_RETURN = 0.07

/** Years used for "if invested for retirement" future value. */
export const RETIREMENT_YEARS = 20
