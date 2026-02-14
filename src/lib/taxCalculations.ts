import type { CalculatorState } from '../App'
import stateDeductions from '../data/stateDeductions.json'
import { getFederalTax } from './federalTax'
import { getStateTax } from './stateTax'
import { getStateCapitalGainsTax } from './stateCapitalGainsTax'
import { getFederalLTCGTax, getLongTermRate } from './capitalGainsTax'
import { getSalesTax, getSalesTaxRate } from './salesTax'
import { getCityTax } from './cityTax'
import { getFica } from './fica'
import { getStateDisability } from './stateDisability'
import { getSelfEmploymentTax } from './selfEmploymentTax'
import type { FilingStatus } from '../App'
import { toYearly } from './periods'

const MN_INVESTMENT_SURCHARGE_THRESHOLD = 1_000_000
const MN_SURCHARGE_RATE = 0.01

const STANDARD_DEDUCTION_2025: Record<FilingStatus, number> = {
  single: 15_750,
  married: 31_500,
}

export interface TaxResults {
  federal: number
  state: number
  city: number
  fica: number
  selfEmployment: number
  stateDisability: number
  sales: number
  capitalGains: number
  ltcgAmount: number
  ltcgRatePercent: number
  totalTax: number
  totalAmount: number
  finalTotal: number
  /** Purchase price + sales tax (total you pay for the item). */
  purchaseTotalWithTax: number
  /** Wages only (for FICA/SDI). */
  wagesYearly: number
  /** Ordinary income before deduction (wages + business + short-term gains). */
  federalOrdinaryIncome: number
  /** Federal taxable income (after standard deduction if applied). */
  federalTaxableIncome: number
  /** Standard deduction applied (0 if not used). */
  standardDeductionApplied: number
  /** State standard deduction applied (0 if not used or not available). */
  stateStandardDeductionApplied: number
  /** State taxable income (wages + business - state deduction + short-term + long-term) for bracket display. */
  stateTaxableIncome: number
  filingStatus: FilingStatus
  stateCode: string
  cityId: string
  purchaseAmount: number
  salesTaxRatePercent: number | null
  shortTermAmount: number
  longTermAmount: number
  /** Business/SE income (yearly) for SE tax and helper. */
  businessIncomeYearly: number
  /** Taxes if stocks (and purchase) were zero: income-only view. */
  incomeOnly: {
    federal: number
    state: number
    city: number
    fica: number
    selfEmployment: number
    stateDisability: number
    total: number
  }
  /** Taxes attributable to stocks only (short-term as income + long-term cap gains). */
  stocksOnly: {
    federalShortTerm: number
    stateShortTerm: number
    cityShortTerm: number
    federalLongTerm: number
    stateLongTerm: number
    stateOther: number
    total: number
  }
}

/**
 * Income, stocks, and purchase are independent.
 * - Federal = tax on all ordinary income (wages + short-term gains). Capital gains row = federal LTCG tax only.
 * - State = income tax + state tax on cap gains. Sales = purchase + state only.
 */
export function calculateTaxes(s: CalculatorState): TaxResults {
  const incomeYearly = toYearly(Number(s.incomeAmount) || 0, s.incomePeriod)
  const businessIncome = toYearly(Number(s.businessIncome) || 0, s.businessIncomePeriod)
  const stocksAmount = Number(s.stocksAmount) || 0
  const shortTermPct = Number(s.shortTermPercent)
  const pct = Number.isFinite(shortTermPct)
    ? Math.max(0, Math.min(100, shortTermPct)) / 100
    : 0.5
  const shortTermAmount = stocksAmount * pct
  const longTermAmount = stocksAmount * (1 - pct)

  // Ordinary income = W-2 + business + short-term gains (base for federal/state/city income tax)
  const ordinaryIncome = incomeYearly + businessIncome + shortTermAmount
  const stdDeduction = s.useStandardDeduction ? STANDARD_DEDUCTION_2025[s.filingStatus] : 0
  const federalTaxableIncome = Math.max(0, ordinaryIncome - stdDeduction)
  const federal = getFederalTax(federalTaxableIncome, s.filingStatus)
  // State: tax on (wages + business - state standard deduction) + cap gains
  const stateTaxableWagesAndBusiness = incomeYearly + businessIncome
  const deductions = stateDeductions as Record<string, { single: number; married: number }>
  const stateStdDeduction =
    s.useStateStandardDeduction && s.state ? (deductions[s.state]?.[s.filingStatus] ?? 0) : 0
  const stateTaxableBase = Math.max(0, stateTaxableWagesAndBusiness - stateStdDeduction)
  const stateOnIncome = getStateTax(stateTaxableBase, s.state, s.filingStatus)
  const stateOnCapGains = getStateCapitalGainsTax(
    stateTaxableBase,
    shortTermAmount,
    longTermAmount,
    s.state,
    s.filingStatus
  )
  let state = stateOnIncome + stateOnCapGains
  if (s.state === 'MN' && stateTaxableWagesAndBusiness + stocksAmount > MN_INVESTMENT_SURCHARGE_THRESHOLD) {
    state += (stateTaxableWagesAndBusiness + stocksAmount - MN_INVESTMENT_SURCHARGE_THRESHOLD) * MN_SURCHARGE_RATE
  }
  state = Math.round(state * 100) / 100

  const city = Math.round(getCityTax(ordinaryIncome, s.city, s.filingStatus) * 100) / 100

  const ficaResult = getFica(incomeYearly, s.filingStatus)
  const fica = ficaResult.total
  const seResult = getSelfEmploymentTax(businessIncome, incomeYearly, s.filingStatus)
  const selfEmployment = seResult.total
  const stateDisability = Math.round(getStateDisability(incomeYearly, s.state) * 100) / 100

  const purchaseAmount = Number(s.purchaseAmount) || 0
  const sales = getSalesTax(purchaseAmount, s.state)
  const salesTaxRatePercent = getSalesTaxRate(s.state)

  const capitalGains = getFederalLTCGTax(federalTaxableIncome, longTermAmount, s.filingStatus)
  const incomeForLtBracket = federalTaxableIncome + longTermAmount
  const ltcgRatePercent = getLongTermRate(incomeForLtBracket, s.filingStatus)

  const totalTax = federal + state + city + fica + selfEmployment + stateDisability + sales + capitalGains
  const totalAmount = incomeYearly + businessIncome + stocksAmount + purchaseAmount
  /** Purchase price + sales tax (what you pay for the item). */
  const purchaseTotalWithTax = purchaseAmount + sales
  /** Money after income/cap gains taxes only (purchase not folded in). */
  const finalTotal =
    incomeYearly +
    businessIncome +
    stocksAmount -
    (federal + state + city + fica + selfEmployment + stateDisability + capitalGains)

  // Income-only: taxes as if stocks = 0 and purchase = 0
  const federalTaxableNoStocks = Math.max(0, incomeYearly + businessIncome - stdDeduction)
  const federalNoStocks = getFederalTax(federalTaxableNoStocks, s.filingStatus)
  const stateNoStocksIncome = getStateTax(stateTaxableBase, s.state, s.filingStatus)
  const mnNoStocks =
    s.state === 'MN' && stateTaxableWagesAndBusiness > MN_INVESTMENT_SURCHARGE_THRESHOLD
      ? (stateTaxableWagesAndBusiness - MN_INVESTMENT_SURCHARGE_THRESHOLD) * MN_SURCHARGE_RATE
      : 0
  const stateNoStocks = Math.round((stateNoStocksIncome + mnNoStocks) * 100) / 100
  const cityNoStocks = Math.round(getCityTax(incomeYearly + businessIncome, s.city, s.filingStatus) * 100) / 100
  const incomeOnlyTotal =
    federalNoStocks + stateNoStocks + cityNoStocks + fica + seResult.total + stateDisability

  // Stocks-only: incremental tax from stocks (short-term taxed as income + long-term cap gains)
  const federalShortTerm = Math.round((federal - federalNoStocks) * 100) / 100
  const federalLongTerm = capitalGains
  const stateOnIncomeWithShortTerm = getStateTax(
    stateTaxableBase + shortTermAmount,
    s.state,
    s.filingStatus
  )
  const stateOnIncomeWithShortAndLong = getStateTax(
    stateTaxableBase + shortTermAmount + longTermAmount,
    s.state,
    s.filingStatus
  )
  const stateShortTerm = Math.round((stateOnIncomeWithShortTerm - stateOnIncome) * 100) / 100
  const stateLongTerm = Math.round((stateOnIncomeWithShortAndLong - stateOnIncomeWithShortTerm) * 100) / 100
  // Residual: MN surcharge from stocks, or full state LTCG tax for WA (getStateTax=0), or rounding/special-state adjustment
  const stateOther = Math.round((state - stateNoStocks - stateShortTerm - stateLongTerm) * 100) / 100
  const cityShortTerm = Math.round((city - cityNoStocks) * 100) / 100
  const stocksOnlyTotal =
    federalShortTerm + stateShortTerm + cityShortTerm + federalLongTerm + stateLongTerm + stateOther

  return {
    federal,
    state,
    city,
    fica,
    selfEmployment,
    stateDisability,
    sales,
    capitalGains,
    ltcgAmount: longTermAmount,
    ltcgRatePercent,
    totalTax,
    totalAmount,
    finalTotal,
    purchaseTotalWithTax,
    wagesYearly: incomeYearly,
    federalOrdinaryIncome: ordinaryIncome,
    federalTaxableIncome,
    standardDeductionApplied: stdDeduction,
    stateStandardDeductionApplied: stateStdDeduction,
    stateTaxableIncome: stateTaxableBase + shortTermAmount + longTermAmount,
    filingStatus: s.filingStatus,
    stateCode: s.state,
    cityId: s.city,
    purchaseAmount,
    salesTaxRatePercent,
    shortTermAmount,
    longTermAmount,
    businessIncomeYearly: businessIncome,
    incomeOnly: {
      federal: federalNoStocks,
      state: stateNoStocks,
      city: cityNoStocks,
      fica,
      selfEmployment: seResult.total,
      stateDisability,
      total: Math.round(incomeOnlyTotal * 100) / 100,
    },
    stocksOnly: {
      federalShortTerm,
      stateShortTerm,
      cityShortTerm,
      federalLongTerm,
      stateLongTerm,
      stateOther,
      total: Math.round(stocksOnlyTotal * 100) / 100,
    },
  }
}
