import { useState, useMemo, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { toPng } from 'html-to-image'
import Ad from './components/Ad'
import LocationSelect from './components/LocationSelect'
import StateComparison, { type StateTaxRow } from './components/StateComparison'
import { AD_TEST_MODE, ADSENSE_CLIENT_ID, AD_SLOT_FOOTER, AD_SLOT_MIDDLE, AD_SLOT_TOP, SHOW_ADS } from './config/ads'
import { US_STATES } from './data/states'
import { getAllMajorCities } from './lib/cityTax'
import IncomeInput from './components/IncomeInput'
import BusinessIncomeInput from './components/BusinessIncomeInput'
import StandardDeductionRow from './components/StandardDeductionRow'
import StocksInput from './components/StocksInput'
import PurchaseInput from './components/PurchaseInput'
import Results from './components/Results'
import YouCouldHaveBought from './components/YouCouldHaveBought'
import { calculateTaxes } from './lib/taxCalculations'
import {
  PERIOD_RANK,
  YEARLY_TO_PERIOD_DIVISOR,
  HEADLINE_PERIOD_LABEL,
} from './lib/periods'
export type FilingStatus = 'single' | 'married'

export interface CalculatorState {
  incomeAmount: number
  incomePeriod: 'yearly' | 'weekly' | 'daily' | 'hourly'
  businessIncome: number
  businessIncomePeriod: 'yearly' | 'monthly' | 'daily' | 'hourly'
  useStandardDeduction: boolean
  useStateStandardDeduction: boolean
  stocksAmount: number
  shortTermPercent: number
  purchaseAmount: number
  state: string
  city: string
  filingStatus: FilingStatus
}

const CALCULATOR_STORAGE_KEY = 'youthinkyoumade-calculator'

const DEFAULT_CALCULATOR_STATE: CalculatorState = {
  incomeAmount: 0,
  incomePeriod: 'yearly',
  businessIncome: 0,
  businessIncomePeriod: 'yearly',
  useStandardDeduction: true,
  useStateStandardDeduction: true,
  stocksAmount: 0,
  shortTermPercent: 50,
  purchaseAmount: 0,
  state: '',
  city: '',
  filingStatus: 'single',
}

function loadCalculatorState(): CalculatorState {
  if (typeof sessionStorage === 'undefined') return DEFAULT_CALCULATOR_STATE
  try {
    const raw = sessionStorage.getItem(CALCULATOR_STORAGE_KEY)
    if (!raw) return DEFAULT_CALCULATOR_STATE
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== 'object') return DEFAULT_CALCULATOR_STATE
    const p = parsed as Record<string, unknown>
    return {
      incomeAmount: typeof p.incomeAmount === 'number' ? p.incomeAmount : DEFAULT_CALCULATOR_STATE.incomeAmount,
      incomePeriod: ['yearly', 'weekly', 'daily', 'hourly'].includes(String(p.incomePeriod)) ? p.incomePeriod as CalculatorState['incomePeriod'] : DEFAULT_CALCULATOR_STATE.incomePeriod,
      businessIncome: typeof p.businessIncome === 'number' ? p.businessIncome : DEFAULT_CALCULATOR_STATE.businessIncome,
      businessIncomePeriod: ['yearly', 'monthly', 'daily', 'hourly'].includes(String(p.businessIncomePeriod)) ? p.businessIncomePeriod as CalculatorState['businessIncomePeriod'] : DEFAULT_CALCULATOR_STATE.businessIncomePeriod,
      useStandardDeduction: typeof p.useStandardDeduction === 'boolean' ? p.useStandardDeduction : DEFAULT_CALCULATOR_STATE.useStandardDeduction,
      useStateStandardDeduction: typeof p.useStateStandardDeduction === 'boolean' ? p.useStateStandardDeduction : DEFAULT_CALCULATOR_STATE.useStateStandardDeduction,
      stocksAmount: typeof p.stocksAmount === 'number' ? p.stocksAmount : DEFAULT_CALCULATOR_STATE.stocksAmount,
      shortTermPercent: typeof p.shortTermPercent === 'number' ? p.shortTermPercent : DEFAULT_CALCULATOR_STATE.shortTermPercent,
      purchaseAmount: typeof p.purchaseAmount === 'number' ? p.purchaseAmount : DEFAULT_CALCULATOR_STATE.purchaseAmount,
      state: typeof p.state === 'string' ? p.state : DEFAULT_CALCULATOR_STATE.state,
      city: typeof p.city === 'string' ? p.city : DEFAULT_CALCULATOR_STATE.city,
      filingStatus: ['single', 'married'].includes(String(p.filingStatus)) ? p.filingStatus as FilingStatus : DEFAULT_CALCULATOR_STATE.filingStatus,
    }
  } catch {
    return DEFAULT_CALCULATOR_STATE
  }
}

function App() {
  const [state, setState] = useState<CalculatorState>(loadCalculatorState)

  useEffect(() => {
    sessionStorage.setItem(CALCULATOR_STORAGE_KEY, JSON.stringify(state))
  }, [state])

  const results = calculateTaxes(state)

  const periodsWithIncome: string[] = []
  if (state.incomeAmount > 0) periodsWithIncome.push(state.incomePeriod)
  if (state.businessIncome > 0) periodsWithIncome.push(state.businessIncomePeriod)
  const headlinePeriod =
    periodsWithIncome.length === 0
      ? 'yearly'
      : periodsWithIncome.sort((a, b) => (PERIOD_RANK[b] ?? 0) - (PERIOD_RANK[a] ?? 0))[0]
  const periodLabel = headlinePeriod === 'yearly' ? 'this year' : (HEADLINE_PERIOD_LABEL[headlinePeriod] ?? 'a year')
  const divisor = YEARLY_TO_PERIOD_DIVISOR[headlinePeriod] ?? 1
  const headlineGross = (results.totalAmount - results.purchaseAmount) / divisor
  const headlineNet = results.finalTotal / divisor
  const headlineUsesDecimals = headlinePeriod === 'hourly' || headlinePeriod === 'daily' || headlinePeriod === 'monthly'
  function formatHeadlineCurrency(n: number): string {
    if (!headlineUsesDecimals) {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n)
    }
    const isWhole = n === Math.round(n)
    if (isWhole) {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n)
    }
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)
  }

  const hasNonYearly = periodsWithIncome.some((p) => p !== 'yearly')
  const periodsToShow =
    periodsWithIncome.length === 0
      ? []
      : hasNonYearly
        ? [...new Set(['yearly', ...periodsWithIncome])].sort((a, b) => (PERIOD_RANK[b] ?? 0) - (PERIOD_RANK[a] ?? 0))
        : []

  const stateComparisonRows = useMemo((): StateTaxRow[] => {
    return US_STATES.map(({ code, name }) => {
      const r = calculateTaxes({ ...state, state: code, city: '' })
      return { stateCode: code, stateName: name, totalTax: r.totalTax }
    }).sort((a, b) => b.totalTax - a.totalTax)
  }, [state])

  const cityComparisonRows = useMemo(() => {
    return getAllMajorCities()
      .map(({ id, name, state: stateCode }) => {
        const r = calculateTaxes({ ...state, state: stateCode, city: id })
        return { cityId: id, cityName: name, stateCode, totalTax: r.totalTax }
      })
      .sort((a, b) => b.totalTax - a.totalTax)
  }, [state])

  const leftColumnRef = useRef<HTMLDivElement>(null)
  const shareCardRef = useRef<HTMLDivElement>(null)
  const isSharingRef = useRef(false)
  const [rowHeightPx, setRowHeightPx] = useState<number | null>(null)
  const [shareFeedback, setShareFeedback] = useState<string | null>(null)
  const [isSharing, setIsSharing] = useState(false)
  const shareUrl = typeof window !== 'undefined' ? window.location.origin : 'https://youthinkyoumade.com'
  const shareText = `I thought I made ${formatHeadlineCurrency(headlineGross)} ${periodLabel}. I actually made ${formatHeadlineCurrency(headlineNet)}. See what you actually take home: ${shareUrl}`

  async function handleShare() {
    if (isSharingRef.current) return
    isSharingRef.current = true
    const card = shareCardRef.current
    if (!card) {
      isSharingRef.current = false
      return
    }
    setIsSharing(true)
    setShareFeedback('Creating…')
    try {
      // Briefly show card so it paints (html-to-image needs it visible to capture)
      const prevVisibility = card.style.visibility
      card.style.visibility = 'visible'
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
      const dataUrl = await toPng(card, {
        pixelRatio: 2,
        cacheBust: true,
      })
      card.style.visibility = prevVisibility
      const res = await fetch(dataUrl)
      const blob = await res.blob()
      if (navigator.clipboard?.write) {
        const url = 'https://youthinkyoumade.com'
        const textBlob = new Blob([url], { type: 'text/plain' })
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob, 'text/plain': textBlob })])
        setShareFeedback('Copied!')
      } else {
        if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(shareText)
        setShareFeedback('Copied!')
      }
      setTimeout(() => setShareFeedback(null), 2000)
    } catch {
      if (card) card.style.visibility = 'hidden'
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareText)
        setShareFeedback('Copied!')
        setTimeout(() => setShareFeedback(null), 2000)
      }
    } finally {
      isSharingRef.current = false
      setIsSharing(false)
    }
  }

  useEffect(() => {
    const el = leftColumnRef.current
    if (!el) return
    const update = () => {
      if (window.matchMedia('(min-width: 1280px)').matches) {
        setRowHeightPx(el.getBoundingClientRect().height)
      } else {
        setRowHeightPx(null)
      }
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <div className="min-h-screen bg-zinc-950 bg-gradient-to-b from-zinc-950 to-zinc-900">
      {/* Hidden share card for image capture (1200x630). On-screen but invisible so it paints. */}
      <div
        ref={shareCardRef}
        className="flex flex-col justify-start px-16 pt-14 pb-14"
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          width: 1200,
          height: 630,
          visibility: 'hidden',
          zIndex: -1,
          pointerEvents: 'none',
          fontFamily: 'Inter, system-ui, sans-serif',
          background: 'linear-gradient(to bottom, #09090b 0%, #18181b 100%)',
        }}
      >
        <div className="flex flex-col">
          <p className="text-zinc-100" style={{ fontSize: 96, fontWeight: 600, lineHeight: 1.1, margin: 0 }}>
            I thought I made {formatHeadlineCurrency(headlineGross)} {periodLabel}.
          </p>
        </div>
        <p className="mt-12 text-4xl font-semibold leading-tight text-emerald-400" style={{ fontSize: 56 }}>
          I actually made {formatHeadlineCurrency(headlineNet)}.
        </p>
        <p
          className="text-xl font-medium"
          style={{ position: 'absolute', bottom: 56, left: 64, right: 64, fontSize: 28 }}
        >
          <span className="text-zinc-500">Find out what you could have bought at </span>
          <span className="text-zinc-100">youthinkyoumade.com</span>
        </p>
      </div>

      {/* Horizontal centering and max-width account for the full 4-column layout including the always-visible "You could have bought" column. */}
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center px-4 py-12 lg:max-w-5xl lg:px-6 xl:max-w-7xl min-[1680px]:max-w-[105rem]">
        <div className="mb-2 flex w-full flex-wrap items-center gap-3">
          <p className="text-2xl font-semibold text-zinc-100 lg:text-3xl">
            You think you made {formatHeadlineCurrency(headlineGross)} {periodLabel}. You actually made {formatHeadlineCurrency(headlineNet)}.
          </p>
          <button
            type="button"
            onClick={handleShare}
            disabled={isSharing}
            className="flex shrink-0 items-center gap-2 rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-500 hover:bg-zinc-700 hover:text-zinc-100 disabled:opacity-50 disabled:pointer-events-none"
            aria-label="Share your results"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            {shareFeedback ?? 'Share'}
          </button>
        </div>
        <p className="mb-0.5 w-full text-left text-zinc-400">
          Your real take-home after taxes.
        </p>
        <p className="mb-6 w-full text-left text-zinc-500 lg:mb-8">
          by{' '}
          <a
            href="https://twitter.com/dansplained0"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-zinc-400"
          >
            Dan DeStefano
          </a>
        </p>

        {SHOW_ADS && (
          <div
            className="mb-6 shrink-0 lg:mb-8"
            style={{ height: 90, overflow: 'hidden', position: 'relative', width: '100%' }}
          >
            <Ad
              clientId={ADSENSE_CLIENT_ID}
              slotId={AD_SLOT_TOP}
              format="horizontal"
              testMode={AD_TEST_MODE}
              className="!block h-full min-h-0 w-full"
            />
          </div>
        )}

        <div
          className={`w-full flex flex-col gap-8 lg:grid lg:grid-cols-[1fr_22rem] lg:gap-8 xl:grid-cols-[minmax(32rem,1fr)_22rem_22rem] min-[1680px]:grid-cols-[minmax(32rem,1fr)_22rem_22rem_22rem] ${rowHeightPx != null ? 'xl:items-stretch min-[1680px]:items-stretch' : 'xl:items-start min-[1680px]:items-start'}`}
          style={rowHeightPx != null ? { gridTemplateRows: `${rowHeightPx}px` } : undefined}
        >
          <div ref={leftColumnRef} className="min-h-0 min-w-0 space-y-6 lg:max-w-4xl xl:max-w-4xl">
            <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
              <h2 className="mb-4 text-sm font-semibold text-zinc-300">Info</h2>
              <div className="space-y-3">
                <LocationSelect
                  stateCode={state.state}
                  cityId={state.city}
                  filingStatus={state.filingStatus}
                  onChangeState={(stateCode) => setState((s) => ({ ...s, state: stateCode, city: stateCode !== s.state ? '' : s.city }))}
                  onChangeCity={(city) => setState((s) => ({ ...s, city }))}
                  onChangeFilingStatus={(filingStatus) => setState((s) => ({ ...s, filingStatus }))}
                />
              </div>
            </section>
            <div className="space-y-6 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
              <IncomeInput
                amount={state.incomeAmount}
                period={state.incomePeriod}
                onChangeAmount={(incomeAmount) => setState((s) => ({ ...s, incomeAmount }))}
                onChangePeriod={(incomePeriod) => setState((s) => ({ ...s, incomePeriod }))}
                stateCode={state.state}
                cityId={state.city}
                filingStatus={state.filingStatus}
                rightOfLabel={
                  <StandardDeductionRow
                    stateCode={state.state}
                    filingStatus={state.filingStatus}
                    useStateStandardDeduction={state.useStateStandardDeduction}
                    useStandardDeduction={state.useStandardDeduction}
                    onChangeState={(useStateStandardDeduction) => setState((s) => ({ ...s, useStateStandardDeduction }))}
                    onChangeFederal={(useStandardDeduction) => setState((s) => ({ ...s, useStandardDeduction }))}
                  />
                }
              />
              <BusinessIncomeInput
                amount={state.businessIncome}
                period={state.businessIncomePeriod}
                onChangeAmount={(businessIncome) => setState((s) => ({ ...s, businessIncome }))}
                onChangePeriod={(businessIncomePeriod) => setState((s) => ({ ...s, businessIncomePeriod }))}
              />
              <StocksInput
                amount={state.stocksAmount}
                shortTermPercent={state.shortTermPercent}
                onChangeAmount={(stocksAmount) => setState((s) => ({ ...s, stocksAmount }))}
                onChangeShortTermPercent={(shortTermPercent) => setState((s) => ({ ...s, shortTermPercent }))}
              />
              <PurchaseInput
                amount={state.purchaseAmount}
                onChange={(purchaseAmount) => setState((s) => ({ ...s, purchaseAmount }))}
                salesTax={results.sales}
                totalWithTax={results.purchaseTotalWithTax}
              />
            </div>
          </div>

          <div className="flex min-h-0 min-w-0 shrink-0 flex-col gap-6 overflow-hidden lg:w-[22rem]">
            <Results results={results} periodsToShow={periodsToShow} className="min-h-0 flex-1" />
            <YouCouldHaveBought
              totalTax={results.totalTax}
              stateCode={state.state}
              cityId={state.city}
              className="min-h-0 shrink-0 min-[1680px]:hidden"
            />
          </div>
          <div className="flex min-h-0 min-w-0 shrink-0 flex-col gap-6 overflow-hidden lg:col-span-2 lg:w-auto xl:col-span-1 xl:w-[22rem]">
            {SHOW_ADS && (
              <Ad
                clientId={ADSENSE_CLIENT_ID}
                slotId={AD_SLOT_MIDDLE}
                testMode={AD_TEST_MODE}
                className="xl:hidden"
              />
            )}
            <StateComparison
              stateRows={stateComparisonRows}
              cityRows={cityComparisonRows}
              userStateCode={state.state}
              userCityId={state.city}
              userTotalTax={results.totalTax}
              className="min-h-0 flex-1"
            />
          </div>
          <div className="hidden min-h-0 min-w-0 shrink-0 flex-col overflow-hidden min-[1680px]:flex min-[1680px]:w-[22rem]">
            <YouCouldHaveBought
              totalTax={results.totalTax}
              stateCode={state.state}
              cityId={state.city}
              className="min-h-0 shrink-0"
            />
          </div>
        </div>

        {SHOW_ADS && (
          <Ad
            clientId={ADSENSE_CLIENT_ID}
            slotId={AD_SLOT_FOOTER}
            testMode={AD_TEST_MODE}
            className="mt-8"
          />
        )}

        <p className="mt-8 text-center text-xs text-zinc-500">
          Estimates only. Not professional tax or legal advice. Verify with your tax advisor or the IRS.
        </p>
        <p className="mt-3 text-center">
          <Link
            to="/sources"
            state={{ stateCode: state.state, cityId: state.city }}
            className="text-sm text-zinc-500 underline hover:text-zinc-300"
          >
            Tax brackets & sources
          </Link>
        </p>
      </div>
    </div>
  )
}

export default App
