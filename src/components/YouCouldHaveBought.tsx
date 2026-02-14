import { useState, useRef } from 'react'
import { toPng } from 'html-to-image'
import { getYouCouldHaveBought } from '../lib/youCouldHaveBought'
import { RETIREMENT_YEARS } from '../data/youCouldHaveBoughtData'

function formatCurrency(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n)
}

function formatMonths(m: number): string {
  if (m >= 12) {
    const years = m / 12
    return years >= 1.5 ? `${years.toFixed(1)} years` : `${m.toFixed(1)} months`
  }
  return m >= 1 ? `${m.toFixed(1)} months` : `${(m * 30).toFixed(0)} days`
}

function formatYears(y: number): string {
  if (y < 1 / 12) return `${(y * 12).toFixed(1)} months`
  return y >= 1 ? `${y.toFixed(1)} years` : `${(y * 12).toFixed(1)} months`
}

interface YouCouldHaveBoughtProps {
  totalTax: number
  stateCode: string
  cityId: string
  className?: string
}

function buildShareText(data: NonNullable<ReturnType<typeof getYouCouldHaveBought>>): string {
  const parts: string[] = []
  if (data.rentMonths && data.rentMonthly) {
    parts.push(`${formatMonths(data.rentMonths.oneBr)} of 1BR rent in ${data.rentLabel}`)
  }
  parts.push(`${formatMonths(data.carPaymentMonths)} of car payments`)
  parts.push(`${formatMonths(data.healthMonths)} of health insurance`)
  parts.push(`${formatYears(data.groceriesYears)} of groceries`)
  parts.push(`and saved ${formatCurrency(data.retirementFutureValue)} for retirement in ${RETIREMENT_YEARS} years`)
  return `I could have bought ${parts.join(', ')} with what I paid in taxes.`
}

export default function YouCouldHaveBought({
  totalTax,
  stateCode,
  cityId,
  className = '',
}: YouCouldHaveBoughtProps) {
  const data = getYouCouldHaveBought(totalTax, stateCode, cityId)
  const [shareFeedback, setShareFeedback] = useState<string | null>(null)
  const shareCardRef = useRef<HTMLDivElement>(null)
  const isSharingRef = useRef(false)

  async function handleShare() {
    if (!data) return
    if (isSharingRef.current) return
    const card = shareCardRef.current
    if (!card) return
    isSharingRef.current = true
    const shareUrl = typeof window !== 'undefined' ? window.location.origin + (window.location.pathname || '') : ''
    const shareTextForCopy = `${buildShareText(data)} See what your tax could buy: ${shareUrl}`
    setShareFeedback('Creating…')
    try {
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
        if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(shareTextForCopy)
        setShareFeedback('Copied!')
      }
      setTimeout(() => setShareFeedback(null), 2000)
    } catch {
      if (shareCardRef.current) shareCardRef.current.style.visibility = 'hidden'
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareTextForCopy)
        setShareFeedback('Copied!')
        setTimeout(() => setShareFeedback(null), 2000)
      }
    } finally {
      isSharingRef.current = false
    }
  }

  const shareCardParts = data
    ? (() => {
        const parts: string[] = []
        if (data.rentMonths && data.rentMonthly) {
          parts.push(`${formatMonths(data.rentMonths.oneBr)} of 1BR rent in ${data.rentLabel}`)
        }
        parts.push(`${formatMonths(data.carPaymentMonths)} of car payments`)
        parts.push(`${formatMonths(data.healthMonths)} of health insurance`)
        parts.push(`${formatYears(data.groceriesYears)} of groceries`)
        parts.push(`and saved ${formatCurrency(data.retirementFutureValue)} for retirement in ${RETIREMENT_YEARS} years`)
        return parts
      })()
    : []

  return (
    <>
      {data && (
        <div
          ref={shareCardRef}
          className="flex flex-col justify-start px-16 pb-14"
          style={{
            position: 'fixed',
            left: 0,
            top: 0,
            width: 1200,
            height: 630,
            paddingTop: 32,
            visibility: 'hidden',
            zIndex: -1,
            pointerEvents: 'none',
            fontFamily: 'Inter, system-ui, sans-serif',
            background: 'linear-gradient(to bottom, #09090b 0%, #18181b 100%)',
          }}
        >
          <p style={{ fontSize: 72, fontWeight: 600, lineHeight: 1.15, margin: 0, color: '#fafafa' }}>
            I could have bought
          </p>
          <div
            style={{
              marginTop: 24,
              marginBottom: 24,
              fontSize: 36,
              fontWeight: 500,
              lineHeight: 1.4,
              color: '#34d399',
            }}
          >
            {shareCardParts.map((part, i) => (
              <p key={i} style={{ margin: 0, marginTop: i === 0 ? 0 : 8 }}>
                {part}
              </p>
            ))}
          </div>
          <p style={{ fontSize: 72, fontWeight: 600, lineHeight: 1.15, margin: 0, color: '#d4d4d8' }}>
            with what I paid in taxes.
          </p>
          <p
            style={{
              position: 'absolute',
              bottom: 56,
              left: 64,
              right: 64,
              fontSize: 28,
              fontWeight: 500,
              margin: 0,
            }}
          >
            <span style={{ color: '#71717a' }}>Find out what you could have bought at </span>
            <span style={{ color: '#f4f4f5' }}>youthinkyoumade.com</span>
          </p>
        </div>
      )}
      <div className={`rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 ${className}`}>
      <div className="mb-1 flex flex-wrap items-center gap-2">
        <h2 className="text-lg font-semibold text-zinc-100">You could have bought</h2>
        {data && (
          <button
            type="button"
            onClick={handleShare}
            className="flex shrink-0 items-center gap-2 rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-500 hover:bg-zinc-700 hover:text-zinc-100"
            aria-label="Share what you could have bought"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            {shareFeedback ?? 'Share'}
          </button>
        )}
      </div>
      <p className="mb-4 text-xs text-zinc-500">
        What your total tax could have paid for (location-based where available).
      </p>
      {!data ? (
        <p className="text-sm text-zinc-500">Enter income to see what your tax could have bought.</p>
      ) : (
      <dl className="space-y-3 text-sm">
        {data.rentMonths && data.rentMonthly && (
          <div>
            <dt className="text-zinc-400">Rent in {data.rentLabel}</dt>
            <dd className="mt-0.5 font-medium text-zinc-200">
              {data.rentSourceUrl ? (
                <a
                  href={data.rentSourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-200 underline decoration-zinc-500 underline-offset-2 hover:text-zinc-100 hover:decoration-zinc-400"
                >
                  {formatMonths(data.rentMonths.oneBr)} of 1BR at {formatCurrency(data.rentMonthly.oneBr)}/mo
                </a>
              ) : (
                <>
                  {formatMonths(data.rentMonths.oneBr)} of 1BR at {formatCurrency(data.rentMonthly.oneBr)}/mo
                </>
              )}
            </dd>
          </div>
        )}
        <div>
          <dt className="text-zinc-400">Car payments</dt>
          <dd className="mt-0.5 font-medium text-zinc-200">
            {formatMonths(data.carPaymentMonths)} (at $735/mo avg. new car)
          </dd>
        </div>
        <div>
          <dt className="text-zinc-400">Health insurance</dt>
          <dd className="mt-0.5 font-medium text-zinc-200">
            {formatMonths(data.healthMonths)} (at $477/mo avg. individual premium)
          </dd>
        </div>
        <div>
          <dt className="text-zinc-400">Groceries</dt>
          <dd className="mt-0.5 font-medium text-zinc-200">
            {formatYears(data.groceriesYears)} (at ~{formatCurrency(data.groceriesMonthly)}/mo for area)
          </dd>
        </div>
        <div>
          <dt className="text-zinc-400">Saved for retirement</dt>
          <dd className="mt-0.5 font-medium text-emerald-400">
            and saved {formatCurrency(data.retirementFutureValue)} for retirement in {RETIREMENT_YEARS} years
          </dd>
          <p className="mt-0.5 text-xs text-zinc-500">Assumes 7% annual return (e.g. 401k/Roth IRA).</p>
        </div>
      </dl>
      )}
    </div>
    </>
  )
}
