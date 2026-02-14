/**
 * Single source of truth for income period conversion and display.
 * Used by tax calculations, inputs, headline, and results to avoid drift.
 */

/** Multiply amount in this period by this factor to get yearly equivalent. */
export const PERIOD_TO_YEARLY_FACTOR: Record<string, number> = {
  yearly: 1,
  monthly: 12,
  weekly: 52,
  daily: 260,
  hourly: 2080,
}

/** Divide yearly amount by this to get amount in period. */
export const YEARLY_TO_PERIOD_DIVISOR: Record<string, number> = {
  yearly: 1,
  monthly: 12,
  weekly: 52,
  daily: 260,
  hourly: 2080,
}

/** Higher = longer period; used to pick "longest" period for headline. */
export const PERIOD_RANK: Record<string, number> = {
  yearly: 5,
  monthly: 4,
  weekly: 3,
  daily: 2,
  hourly: 1,
}

/** Adjective for totals: "Yearly income", "Daily tax". */
export const PERIOD_ADJECTIVE: Record<string, string> = {
  yearly: 'Yearly',
  monthly: 'Monthly',
  weekly: 'Weekly',
  daily: 'Daily',
  hourly: 'Hourly',
}

/** Headline: "a year", "a day". */
export const HEADLINE_PERIOD_LABEL: Record<string, string> = {
  yearly: 'a year',
  monthly: 'a month',
  weekly: 'a week',
  daily: 'a day',
  hourly: 'an hour',
}

const ROUND_TO_TWO_DECIMALS = new Set(['monthly', 'daily', 'hourly'])

export function toYearly(amount: number, period: string): number {
  const factor = PERIOD_TO_YEARLY_FACTOR[period] ?? 1
  return amount * factor
}

export function fromYearly(yearly: number, period: string): number {
  const divisor = YEARLY_TO_PERIOD_DIVISOR[period] ?? 1
  const value = yearly / divisor
  if (ROUND_TO_TWO_DECIMALS.has(period)) {
    return Math.round(value * 100) / 100
  }
  return value
}

/** Round amount to the correct precision for this period (2 decimals for monthly/daily/hourly). */
export function roundAmountForPeriod(amount: number, period: string): number {
  return fromYearly(toYearly(amount, period), period)
}

/** Whether this period should use step=0.01 in number inputs. */
export function useTwoDecimalStep(period: string): boolean {
  return ROUND_TO_TWO_DECIMALS.has(period)
}

/** Income slider: max yearly value and step. */
export const INCOME_SLIDER_MAX_YEARLY = 500_000
export const INCOME_SLIDER_STEP = 1000

/** Format yearly amount for slider label: $1.2M, $50k, $500. */
export function formatYearlyLabel(yearly: number): string {
  if (yearly >= 1_000_000) return `$${(yearly / 1_000_000).toFixed(1)}M`
  if (yearly >= 1000) return `$${(yearly / 1000).toFixed(0)}k`
  return `$${Math.round(yearly)}`
}
