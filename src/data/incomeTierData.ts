/**
 * Income tier data by location for “typical income” and percentile labels.
 * First line: Below / Around / Above typical [Location], Top 20%, Top 10%.
 * Based on Census Bureau median household income and income distribution by area.
 * @see INCOME_TIER_SOURCES in sourceLinks.ts
 */

export interface LocationTier {
  /** Display name for the location (e.g. "NYC", "California"). */
  label: string
  /** Median household income (typical). */
  median: number
  /** 80th percentile – “Top 20%” threshold. */
  p80: number
  /** 90th percentile – “Top 10%” threshold. */
  p90: number
}

/** Key: stateCode or "stateCode_cityId" for city-specific. */
export const INCOME_TIERS_BY_LOCATION: Record<string, LocationTier> = {
  US: {
    label: 'US',
    median: 75_000,
    p80: 130_000,
    p90: 185_000,
  },
  NY: {
    label: 'New York',
    median: 80_000,
    p80: 145_000,
    p90: 210_000,
  },
  NY_NYC: {
    label: 'NYC',
    median: 76_000,
    p80: 155_000,
    p90: 235_000,
  },
  CA: {
    label: 'California',
    median: 91_000,
    p80: 165_000,
    p90: 250_000,
  },
  TX: {
    label: 'Texas',
    median: 68_000,
    p80: 118_000,
    p90: 170_000,
  },
  FL: {
    label: 'Florida',
    median: 67_000,
    p80: 115_000,
    p90: 165_000,
  },
  PA: {
    label: 'Pennsylvania',
    median: 73_000,
    p80: 128_000,
    p90: 185_000,
  },
  PA_Philadelphia: {
    label: 'Philadelphia',
    median: 52_000,
    p80: 95_000,
    p90: 140_000,
  },
  OH: {
    label: 'Ohio',
    median: 66_000,
    p80: 115_000,
    p90: 168_000,
  },
  MI: {
    label: 'Michigan',
    median: 68_000,
    p80: 120_000,
    p90: 175_000,
  },
  MI_Detroit: {
    label: 'Detroit',
    median: 38_000,
    p80: 72_000,
    p90: 105_000,
  },
  NJ: {
    label: 'New Jersey',
    median: 96_000,
    p80: 175_000,
    p90: 260_000,
  },
  IL: {
    label: 'Illinois',
    median: 78_000,
    p80: 138_000,
    p90: 200_000,
  },
  MA: {
    label: 'Massachusetts',
    median: 96_000,
    p80: 175_000,
    p90: 260_000,
  },
  WA: {
    label: 'Washington',
    median: 90_000,
    p80: 162_000,
    p90: 240_000,
  },
  CO: {
    label: 'Colorado',
    median: 87_000,
    p80: 155_000,
    p90: 228_000,
  },
  GA: {
    label: 'Georgia',
    median: 71_000,
    p80: 125_000,
    p90: 182_000,
  },
  NC: {
    label: 'North Carolina',
    median: 68_000,
    p80: 120_000,
    p90: 175_000,
  },
  VA: {
    label: 'Virginia',
    median: 87_000,
    p80: 155_000,
    p90: 228_000,
  },
  AZ: {
    label: 'Arizona',
    median: 72_000,
    p80: 128_000,
    p90: 188_000,
  },
  TN: {
    label: 'Tennessee',
    median: 62_000,
    p80: 108_000,
    p90: 158_000,
  },
  IN: {
    label: 'Indiana',
    median: 66_000,
    p80: 115_000,
    p90: 168_000,
  },
  MO: {
    label: 'Missouri',
    median: 65_000,
    p80: 115_000,
    p90: 168_000,
  },
  MD: {
    label: 'Maryland',
    median: 98_000,
    p80: 178_000,
    p90: 265_000,
  },
  MN: {
    label: 'Minnesota',
    median: 84_000,
    p80: 148_000,
    p90: 218_000,
  },
  WI: {
    label: 'Wisconsin',
    median: 72_000,
    p80: 128_000,
    p90: 188_000,
  },
  OH_Cleveland: {
    label: 'Cleveland',
    median: 48_000,
    p80: 88_000,
    p90: 130_000,
  },
  OH_Columbus: {
    label: 'Columbus',
    median: 62_000,
    p80: 110_000,
    p90: 162_000,
  },
  NY_Yonkers: {
    label: 'Yonkers',
    median: 72_000,
    p80: 130_000,
    p90: 192_000,
  },
}

/**
 * Income class labels (second line). Thresholds are approximate and based on
 * federal poverty guidelines (HHS) and Pew Research / common usage.
 * Single = 1 person; married = 2 person household.
 */
export const POVERTY_GUIDELINE_2024 = {
  single: 15_060,
  married: 20_440,
} as const

/** Yearly income thresholds (single) for class labels. */
export const CLASS_THRESHOLDS_SINGLE = {
  poverty: 15_060,
  workingClass: 35_000,
  lowerMiddle: 55_000,
  middle: 90_000,
  upperMiddle: 150_000,
} as const

/** Yearly income thresholds (married, 2-person household). */
export const CLASS_THRESHOLDS_MARRIED = {
  poverty: 20_440,
  workingClass: 52_000,
  lowerMiddle: 82_000,
  middle: 135_000,
  upperMiddle: 225_000,
} as const
