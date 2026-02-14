import { useState } from 'react'

export interface StateTaxRow {
  stateCode: string
  stateName: string
  totalTax: number
}

export interface CityTaxRow {
  cityId: string
  cityName: string
  stateCode: string
  totalTax: number
}

type ComparisonTab = 'state' | 'city'

interface StateComparisonProps {
  stateRows: StateTaxRow[]
  cityRows: CityTaxRow[]
  userStateCode: string
  userCityId: string
  userTotalTax: number
  className?: string
}

function formatCurrency(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n)
}

function formatDiff(diff: number): string {
  if (diff === 0) return 'Same'
  if (diff > 0) return `+${formatCurrency(diff)}`
  return formatCurrency(diff) // already includes minus
}

const diffClass = (diff: number | null) =>
  diff != null && diff > 0
    ? 'text-red-400'
    : diff != null && diff < 0
      ? 'text-emerald-400'
      : ''

export default function StateComparison({
  stateRows,
  cityRows,
  userStateCode,
  userCityId,
  userTotalTax,
  className = '',
}: StateComparisonProps) {
  const [tab, setTab] = useState<ComparisonTab>('state')

  const stateUserTotal = stateRows.find((r) => r.stateCode === userStateCode)?.totalTax ?? null

  const tabs: { id: ComparisonTab; label: string }[] = [
    { id: 'state', label: 'State' },
    { id: 'city', label: 'City' },
  ]

  return (
    <div
      className={`flex min-h-0 flex-col rounded-xl border border-zinc-800 bg-zinc-900/50 ${className}`}
    >
      <div className="flex shrink-0 border-b border-zinc-800">
        {tabs.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              tab === id
                ? 'border-b-2 border-zinc-400 text-zinc-100'
                : 'text-zinc-400 hover:text-zinc-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <h2 className="shrink-0 border-b border-zinc-800 px-4 py-3 text-sm font-semibold text-zinc-300">
        {tab === 'state' ? 'Tax vs your state (same income)' : 'Tax vs your city (same income)'}
      </h2>

      {tab === 'state' && (
        <ul className="scrollbar-app min-h-0 flex-1 overflow-y-auto px-2 py-2" role="list">
          {stateRows.map(({ stateCode, stateName, totalTax }) => {
            const isUser = stateCode === userStateCode
            const diff = stateUserTotal != null ? totalTax - stateUserTotal : null
            return (
              <li
                key={stateCode}
                className={`flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-sm ${
                  isUser ? 'bg-zinc-700/80 text-zinc-100' : 'text-zinc-300'
                }`}
              >
                <span className="min-w-0 truncate">
                  {stateName}
                  {isUser && (
                    <span className="ml-1.5 text-xs text-zinc-400">(you)</span>
                  )}
                </span>
                <span className={`shrink-0 font-medium tabular-nums ${diffClass(diff)}`}>
                  {isUser ? '—' : diff != null ? formatDiff(diff) : formatCurrency(totalTax)}
                </span>
              </li>
            )
          })}
        </ul>
      )}

      {tab === 'city' && (
        <ul className="scrollbar-app min-h-0 flex-1 overflow-y-auto px-2 py-2" role="list">
          {cityRows.map(({ cityId, cityName, stateCode, totalTax }) => {
            const isUser = stateCode === userStateCode && cityId === userCityId
            const diff = totalTax - userTotalTax
            return (
              <li
                key={`${stateCode}-${cityId}`}
                className={`flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-sm ${
                  isUser ? 'bg-zinc-700/80 text-zinc-100' : 'text-zinc-300'
                }`}
              >
                <span className="min-w-0 truncate">
                  {cityName}, {stateCode}
                  {isUser && (
                    <span className="ml-1.5 text-xs text-zinc-400">(you)</span>
                  )}
                </span>
                <span className={`shrink-0 font-medium tabular-nums ${diffClass(diff)}`}>
                  {isUser ? '—' : formatDiff(diff)}
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
