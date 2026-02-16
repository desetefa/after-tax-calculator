/**
 * State government spending by category as share of total (0–1).
 * National average; based on NASBO State Expenditure Report and Census state finances.
 * Update with exact figures from https://www.nasbo.org/reports-data/state-expenditure-report
 * or Census State and Local Government Finances.
 */
export interface StateSpendingCategory {
  label: string
  /** Share of total state spending (0–1). */
  share: number
}

/** State spending breakdown (percentages sum to 1). Approximate national average. */
export const STATE_SPENDING_CATEGORIES: StateSpendingCategory[] = [
  { label: 'K‑12 education', share: 0.19 },
  { label: 'Medicaid', share: 0.27 },
  { label: 'Higher education', share: 0.09 },
  { label: 'Transportation', share: 0.08 },
  { label: 'Corrections', share: 0.03 },
  { label: 'Public safety', share: 0.04 },
  { label: 'Other', share: 0.30 },
]
