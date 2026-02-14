import { useState } from 'react'
import type { TaxResults } from '../lib/taxCalculations'
import { getCityTaxHelper } from '../lib/cityTax'
import { getFicaHelper } from '../lib/fica'
import { getSelfEmploymentTaxHelper } from '../lib/selfEmploymentTax'
import { getStateDisabilityHelper } from '../lib/stateDisability'
import federalBrackets from '../data/federalBrackets.json'
import stateRates from '../data/stateRates.json'
import { PERIOD_ADJECTIVE, YEARLY_TO_PERIOD_DIVISOR } from '../lib/periods'

type ResultsTab = 'all' | 'income' | 'stocks'

const federal = federalBrackets as { single: { max: number; rate: number }[]; married: { max: number; rate: number }[] }
const stateRatesMap = stateRates as Record<string, { noIncomeTax?: boolean; capitalGainsOnly?: boolean; brackets?: { max: number; rate: number }[] }>

function formatCurrency(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n)
}

function formatWhole(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n)
}

function amountAtRates(income: number, brackets: { max: number; rate: number }[]): string {
  let prev = 0
  const parts: string[] = []
  for (const b of brackets) {
    const chunk = Math.min(income, b.max) - prev
    if (chunk > 0) parts.push(`${formatWhole(chunk)} at ${b.rate}%`)
    if (income <= b.max) break
    prev = b.max
  }
  return parts.join(', ')
}

/** Renders helper text with each bracket/segment on its own line (splits on ", " or "; "). */
function HelperLines({ text }: { text: string }) {
  if (!text || text === '—') {
    return <p className="mt-1 text-xs text-zinc-500">—</p>
  }
  const segments = text.split(/, |; /)
  return (
    <p className="mt-1 text-xs text-zinc-500">
      {segments.map((line, i) => (
        <span key={i} className="block">
          {line}
        </span>
      ))}
    </p>
  )
}

interface IncomeTaxBreakdownProps {
  federal: number
  state: number
  city: number
  fica: number
  selfEmployment: number
  stateDisability: number
  showCity: boolean
  showFica: boolean
  showSe: boolean
  showSdi: boolean
  helpers: {
    federal: string
    state: string
    city: string
    fica: string
    se: string
    sdi: string
  }
}

function IncomeTaxBreakdown({
  federal,
  state,
  city,
  fica,
  selfEmployment,
  stateDisability,
  showCity,
  showFica,
  showSe,
  showSdi,
  helpers,
}: IncomeTaxBreakdownProps) {
  return (
    <>
      <div>
        <div className="flex justify-between">
          <dt className="text-zinc-400">Federal</dt>
          <dd className="font-medium text-zinc-200">{formatCurrency(federal)}</dd>
        </div>
        <HelperLines text={helpers.federal} />
      </div>
      <div>
        <div className="flex justify-between">
          <dt className="text-zinc-400">State</dt>
          <dd className="font-medium text-zinc-200">{formatCurrency(state)}</dd>
        </div>
        <HelperLines text={helpers.state} />
      </div>
      {showCity && (
        <div>
          <div className="flex justify-between">
            <dt className="text-zinc-400">City</dt>
            <dd className="font-medium text-zinc-200">{formatCurrency(city)}</dd>
          </div>
          <HelperLines text={helpers.city} />
        </div>
      )}
      {showFica && (
        <div>
          <div className="flex justify-between">
            <dt className="text-zinc-400">Payroll (FICA)</dt>
            <dd className="font-medium text-zinc-200">{formatCurrency(fica)}</dd>
          </div>
          <HelperLines text={helpers.fica} />
        </div>
      )}
      {showSe && (
        <div>
          <div className="flex justify-between">
            <dt className="text-zinc-400">Self-employment tax</dt>
            <dd className="font-medium text-zinc-200">{formatCurrency(selfEmployment)}</dd>
          </div>
          <HelperLines text={helpers.se} />
        </div>
      )}
      {showSdi && (
        <div>
          <div className="flex justify-between">
            <dt className="text-zinc-400">State disability</dt>
            <dd className="font-medium text-zinc-200">{formatCurrency(stateDisability)}</dd>
          </div>
          <HelperLines text={helpers.sdi} />
        </div>
      )}
    </>
  )
}

function formatPeriodCurrency(n: number, _period: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n)
}

interface ResultsProps {
  results: TaxResults
  periodsToShow?: string[]
  className?: string
}

export default function Results({ results, periodsToShow = [], className = '' }: ResultsProps) {
  const [tab, setTab] = useState<ResultsTab>('all')
  const federalBracketList = results.filingStatus === 'married' ? federal.married : federal.single
  const federalHelper = results.federalTaxableIncome > 0
    ? (amountAtRates(results.federalTaxableIncome, federalBracketList) +
        (results.standardDeductionApplied > 0
          ? ` (after $${results.standardDeductionApplied.toLocaleString()} standard deduction)`
          : ''))
    : results.federalOrdinaryIncome > 0 && results.standardDeductionApplied > 0
      ? `Fully offset by $${results.standardDeductionApplied.toLocaleString()} standard deduction`
      : '—'

  const stateInfo = results.stateCode ? stateRatesMap[results.stateCode] : null
  let stateHelper = '—'
  if (!results.stateCode) {
    stateHelper = 'Select a state to see your state taxes'
  } else if (stateInfo?.brackets && !stateInfo.noIncomeTax && !stateInfo.capitalGainsOnly) {
    stateHelper =
      results.stateTaxableIncome > 0
        ? amountAtRates(results.stateTaxableIncome, stateInfo.brackets) +
          (results.stateStandardDeductionApplied > 0
            ? ` (after $${results.stateStandardDeductionApplied.toLocaleString()} state standard deduction)`
            : '')
        : '—'
  } else if (stateInfo?.capitalGainsOnly && results.ltcgAmount > 250_000) {
    stateHelper = `${formatWhole(results.ltcgAmount - 250_000)} at 7%`
  }

  const cityHelper =
    results.cityId && results.city > 0
      ? getCityTaxHelper(results.cityId, results.federalOrdinaryIncome, results.filingStatus) ?? '—'
      : '—'

  const ficaHelper = results.wagesYearly > 0 ? getFicaHelper(results.wagesYearly, results.filingStatus) : '—'
  const seHelper =
    results.selfEmployment > 0
      ? getSelfEmploymentTaxHelper(results.businessIncomeYearly, results.wagesYearly, results.filingStatus)
      : '—'
  const sdiHelper =
    results.stateDisability > 0 && results.stateCode
      ? getStateDisabilityHelper(results.wagesYearly, results.stateCode) ?? '—'
      : '—'

  const capGainsHelper =
    results.shortTermAmount > 0 && results.ltcgAmount > 0
      ? `${formatWhole(results.shortTermAmount)} in Federal, ${formatWhole(results.ltcgAmount)} at ${results.ltcgRatePercent}%`
      : results.ltcgAmount > 0
        ? `${formatWhole(results.ltcgAmount)} at ${results.ltcgRatePercent}%`
        : results.shortTermAmount > 0
          ? `${formatWhole(results.shortTermAmount)} in Federal`
          : '—'

  const incomeTaxHelpers = {
    federal: federalHelper,
    state: stateHelper,
    city: cityHelper,
    fica: ficaHelper,
    se: seHelper,
    sdi: sdiHelper,
  }

  const tabs: { id: ResultsTab; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'income', label: 'Income only' },
    { id: 'stocks', label: 'Capital gains' },
  ]

  return (
    <div className={`flex min-h-0 flex-col rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 ${className}`}>
      <div className="scrollbar-app min-h-0 flex-1 overflow-y-auto">
        <h2 className="mb-3 text-lg font-semibold text-zinc-100">After taxes</h2>
        <div className="mb-4 flex gap-1 rounded-lg bg-zinc-800/80 p-1">
          {tabs.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                tab === id
                  ? 'bg-zinc-700 text-zinc-100'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === 'all' && (
          <dl className="space-y-4 text-sm">
            <IncomeTaxBreakdown
              federal={results.federal}
              state={results.state}
              city={results.city}
              fica={results.fica}
              selfEmployment={results.selfEmployment}
              stateDisability={results.stateDisability}
              showCity={!!results.cityId}
              showFica={results.wagesYearly > 0}
              showSe={results.selfEmployment > 0}
              showSdi={results.stateDisability > 0}
              helpers={incomeTaxHelpers}
            />
            <div>
              <div className="flex justify-between">
                <dt className="text-zinc-400">Capital gains</dt>
                <dd className="font-medium text-zinc-200">{formatCurrency(results.capitalGains)}</dd>
              </div>
              <HelperLines text={capGainsHelper} />
            </div>
          </dl>
        )}

        {tab === 'income' && (
          <dl className="space-y-4 text-sm">
            <p className="text-xs text-zinc-500">Taxes on W-2 and business income only (no stocks, no purchase).</p>
            <IncomeTaxBreakdown
              federal={results.incomeOnly.federal}
              state={results.incomeOnly.state}
              city={results.incomeOnly.city}
              fica={results.incomeOnly.fica}
              selfEmployment={results.incomeOnly.selfEmployment}
              stateDisability={results.incomeOnly.stateDisability}
              showCity={!!results.cityId && results.incomeOnly.city > 0}
              showFica={results.incomeOnly.fica > 0}
              showSe={results.incomeOnly.selfEmployment > 0}
              showSdi={results.incomeOnly.stateDisability > 0}
              helpers={incomeTaxHelpers}
            />
          </dl>
        )}

        {tab === 'stocks' && (
        <dl className="space-y-4 text-sm">
          <p className="text-xs text-zinc-500">
            Tax from stocks only (short-term taxed as income; long-term as capital gains), given your income.
          </p>
          {(results.shortTermAmount > 0 || results.ltcgAmount > 0) ? (
            <>
              {results.shortTermAmount > 0 && (
                <>
                  <p className="text-xs font-medium text-zinc-400">Short-term (taxed as income)</p>
                  <div>
                    <div className="flex justify-between">
                      <dt className="text-zinc-400">Federal</dt>
                      <dd className="font-medium text-zinc-200">{formatCurrency(results.stocksOnly.federalShortTerm)}</dd>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between">
                      <dt className="text-zinc-400">State</dt>
                      <dd className="font-medium text-zinc-200">{formatCurrency(results.stocksOnly.stateShortTerm)}</dd>
                    </div>
                  </div>
                  {results.stocksOnly.cityShortTerm > 0 && (
                    <div>
                      <div className="flex justify-between">
                        <dt className="text-zinc-400">City</dt>
                        <dd className="font-medium text-zinc-200">{formatCurrency(results.stocksOnly.cityShortTerm)}</dd>
                      </div>
                    </div>
                  )}
                </>
              )}
              {results.ltcgAmount > 0 && (
                <>
                  <p className="mt-2 text-xs font-medium text-zinc-400">Long-term (capital gains)</p>
                  <div>
                    <div className="flex justify-between">
                      <dt className="text-zinc-400">Federal</dt>
                      <dd className="font-medium text-zinc-200">{formatCurrency(results.stocksOnly.federalLongTerm)}</dd>
                    </div>
                    <p className="mt-1 text-xs text-zinc-500">
                      {formatWhole(results.ltcgAmount)} at {results.ltcgRatePercent}%
                    </p>
                  </div>
                  {(results.stocksOnly.stateLongTerm > 0 || results.stocksOnly.stateOther !== 0) && (
                    <div>
                      <div className="flex justify-between">
                        <dt className="text-zinc-400">State</dt>
                        <dd className="font-medium text-zinc-200">
                          {formatCurrency(results.stocksOnly.stateLongTerm + results.stocksOnly.stateOther)}
                        </dd>
                      </div>
                      {results.stocksOnly.stateOther > 0 && results.stateCode === 'MN' && (
                        <p className="mt-1 text-xs text-zinc-500">Includes MN 1% surcharge on investment income over $1M</p>
                      )}
                    </div>
                  )}
                </>
              )}
            </>
          ) : (
            <p className="text-zinc-500">Enter stocks above to see tax from capital gains.</p>
          )}
        </dl>
        )}
      </div>

      <div className="shrink-0 border-t border-zinc-700 pt-3 mt-3">
        {tab === 'all' && (
          <>
            {periodsToShow
              .filter((p) => p !== 'yearly')
              .map((period) => {
                const div = YEARLY_TO_PERIOD_DIVISOR[period] ?? 1
                const income = (results.totalAmount - results.purchaseAmount) / div
                const tax = (results.totalTax - results.sales) / div
                const final = results.finalTotal / div
                const adj = PERIOD_ADJECTIVE[period] ?? period
                return (
                  <div key={period} className="mb-4">
                    <div className="flex justify-between text-sm">
                      <dt className="text-zinc-400">{adj} income</dt>
                      <dd className="font-medium text-emerald-400">{formatPeriodCurrency(income, period)}</dd>
                    </div>
                    <div className="flex justify-between text-sm pt-1">
                      <dt className="text-zinc-400">{adj} tax</dt>
                      <dd className="font-medium text-red-400">{formatPeriodCurrency(tax, period)}</dd>
                    </div>
                    <div className="flex justify-between border-t border-zinc-700 pt-3 mt-2">
                      <dt className="text-zinc-100 font-medium">{adj} total</dt>
                      <dd className="text-lg font-semibold text-zinc-100">{formatPeriodCurrency(final, period)}</dd>
                    </div>
                  </div>
                )
              })}
            <div className="flex justify-between text-sm">
              <dt className="text-zinc-400">{periodsToShow.filter((p) => p !== 'yearly').length > 0 ? 'Yearly income' : 'Total income'}</dt>
              <dd className="font-medium text-emerald-400">
                {formatCurrency(results.totalAmount - results.purchaseAmount)}
              </dd>
            </div>
            <div className="flex justify-between text-sm pt-1">
              <dt className="text-zinc-400">{periodsToShow.filter((p) => p !== 'yearly').length > 0 ? 'Yearly tax' : 'Total tax'}</dt>
              <dd className="font-medium text-red-400">
                {formatCurrency(results.totalTax - results.sales)}
              </dd>
            </div>
            <div className="flex justify-between border-t border-zinc-700 pt-3 mt-2">
              <dt className="text-zinc-100 font-medium">{periodsToShow.filter((p) => p !== 'yearly').length > 0 ? 'Yearly total' : 'Final total'}</dt>
              <dd className="text-lg font-semibold text-zinc-100">
                {formatCurrency(results.finalTotal)}
              </dd>
            </div>
            {results.totalAmount > 0 && (
              <p className="mt-1 text-xs text-zinc-500">
                You lost {Math.round((results.totalTax / results.totalAmount) * 100)}% of your income
              </p>
            )}
          </>
        )}
        {tab === 'income' && (
          <>
            {periodsToShow
              .filter((p) => p !== 'yearly')
              .map((period) => {
                const div = YEARLY_TO_PERIOD_DIVISOR[period] ?? 1
                const income = (results.wagesYearly + results.businessIncomeYearly) / div
                const tax = results.incomeOnly.total / div
                const final = (results.wagesYearly + results.businessIncomeYearly - results.incomeOnly.total) / div
                const adj = PERIOD_ADJECTIVE[period] ?? period
                return (
                  <div key={period} className="mb-4">
                    <div className="flex justify-between text-sm">
                      <dt className="text-zinc-400">{adj} income</dt>
                      <dd className="font-medium text-emerald-400">{formatPeriodCurrency(income, period)}</dd>
                    </div>
                    <div className="flex justify-between text-sm pt-1">
                      <dt className="text-zinc-400">{adj} tax</dt>
                      <dd className="font-medium text-red-400">{formatPeriodCurrency(tax, period)}</dd>
                    </div>
                    <div className="flex justify-between border-t border-zinc-700 pt-3 mt-2">
                      <dt className="text-zinc-100 font-medium">{adj} total</dt>
                      <dd className="text-lg font-semibold text-zinc-100">{formatPeriodCurrency(final, period)}</dd>
                    </div>
                  </div>
                )
              })}
            <div className="flex justify-between text-sm">
              <dt className="text-zinc-400">{periodsToShow.filter((p) => p !== 'yearly').length > 0 ? 'Yearly income' : 'Total income'}</dt>
              <dd className="font-medium text-emerald-400">
                {formatCurrency(results.wagesYearly + results.businessIncomeYearly)}
              </dd>
            </div>
            <div className="flex justify-between text-sm pt-1">
              <dt className="text-zinc-400">{periodsToShow.filter((p) => p !== 'yearly').length > 0 ? 'Yearly tax' : 'Total tax'}</dt>
              <dd className="font-medium text-red-400">{formatCurrency(results.incomeOnly.total)}</dd>
            </div>
            <div className="flex justify-between border-t border-zinc-700 pt-3 mt-2">
              <dt className="text-zinc-100 font-medium">{periodsToShow.filter((p) => p !== 'yearly').length > 0 ? 'Yearly total' : 'Final total'}</dt>
              <dd className="text-lg font-semibold text-zinc-100">
                {formatCurrency(results.wagesYearly + results.businessIncomeYearly - results.incomeOnly.total)}
              </dd>
            </div>
          </>
        )}
        {tab === 'stocks' && (results.shortTermAmount > 0 || results.longTermAmount > 0) && (
          <>
            <div className="flex justify-between text-sm">
              <dt className="text-zinc-400">Gain</dt>
              <dd className="font-medium text-emerald-400">
                {formatCurrency(results.shortTermAmount + results.longTermAmount)}
              </dd>
            </div>
            <div className="flex justify-between text-sm pt-1">
              <dt className="text-zinc-400">Total tax from stocks</dt>
              <dd className="font-medium text-red-400">{formatCurrency(results.stocksOnly.total)}</dd>
            </div>
            <div className="flex justify-between border-t border-zinc-700 pt-3 mt-2">
              <dt className="text-zinc-100 font-medium">Net</dt>
              <dd className="text-lg font-semibold text-zinc-100">
                {formatCurrency(results.shortTermAmount + results.longTermAmount - results.stocksOnly.total)}
              </dd>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
