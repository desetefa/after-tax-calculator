import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import federalBrackets from '../data/federalBrackets.json'
import stateRates from '../data/stateRates.json'
import stateDeductions from '../data/stateDeductions.json'
import cityTaxRates from '../data/cityTaxRates.json'
import stateDisabilityRates from '../data/stateDisabilityRates.json'
import { US_STATES } from '../data/states'
import { getCitiesByState } from '../lib/cityTax'
import {
  FEDERAL_SOURCE,
  FICA_SOURCE,
  STATE_SOURCES,
  STATE_STANDARD_DEDUCTIONS_SOURCE,
  NYC_SOURCE,
  STATE_DISABILITY_SOURCES,
  INCOME_TIER_SOURCES,
  YOU_COULD_HAVE_BOUGHT_SOURCES,
} from '../data/sourceLinks'

const formatMax = (n: number) =>
  n >= 999999999 ? 'and over' : `up to $${(n / 1000).toFixed(0)}k` + (n >= 1_000_000 ? '+' : '')

function Section({
  title,
  children,
  source,
}: {
  title: string
  children: React.ReactNode
  source?: { name: string; url: string }
}) {
  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
      <h2 className="mb-3 text-base font-semibold text-zinc-100">{title}</h2>
      <div className="space-y-2 text-sm text-zinc-300">{children}</div>
      {source && (
        <p className="mt-3 text-xs">
          <span className="text-zinc-500">Source: </span>
          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-400 underline hover:text-zinc-200"
          >
            {source.name}
          </a>
        </p>
      )}
    </section>
  )
}

export default function TaxSourcesPage() {
  const location = useLocation()
  const stateFromRoute = (location.state as { stateCode?: string; cityId?: string } | null)?.stateCode ?? ''
  const cityFromRoute = (location.state as { stateCode?: string; cityId?: string } | null)?.cityId ?? ''

  const [stateCode, setStateCode] = useState(stateFromRoute || '')
  const [cityId, setCityId] = useState(cityFromRoute || '')

  useEffect(() => {
    const s = location.state as { stateCode?: string; cityId?: string } | null
    if (s?.stateCode != null) setStateCode(s.stateCode)
    if (s?.cityId != null) setCityId(s.cityId)
    else if (s?.stateCode != null) setCityId('')
  }, [location.state])

  const citiesInState = stateCode ? getCitiesByState(stateCode) : []
  const stateInfo = stateCode ? (stateRates as Record<string, { brackets?: { max: number; rate: number }[]; noIncomeTax?: boolean }>)[stateCode] : null
  const stateDed = stateCode ? (stateDeductions as Record<string, { single: number; married: number }>)[stateCode] : null
  const cityInfo = cityId ? (cityTaxRates as Record<string, { name: string; rate?: number; brackets?: { single: { max: number; rate: number }[] } }>)[cityId] : null
  const sdiInfo = stateCode ? (stateDisabilityRates as Record<string, { name: string; rate: number; wageBase?: number | null; maxWithholding?: number | null }>)[stateCode] : null

  const federal = federalBrackets as { single: { max: number; rate: number }[]; married: { max: number; rate: number }[] }

  return (
    <div className="min-h-screen bg-zinc-950 bg-gradient-to-b from-zinc-950 to-zinc-900">
      <div className="mx-auto max-w-2xl px-4 py-10">
        <Link
          to="/"
          className="mb-6 inline-block text-sm text-zinc-500 hover:text-zinc-300"
        >
          ← Back to calculator
        </Link>
        <h1 className="mb-2 text-2xl font-semibold text-zinc-100">
          Tax brackets & sources
        </h1>
        <p className="mb-6 text-zinc-400">
          Numbers used in this app and links to the official sites we used. Federal and FICA are 2025; state and city data may be 2024 where 2025 rates are not yet updated.
        </p>

        <div className="mb-6 rounded-lg border border-zinc-700 bg-zinc-800/50 p-4">
          <p className="mb-2 text-sm font-medium text-zinc-400">Your location</p>
          <p className="mb-3 text-xs text-zinc-500">
            {stateFromRoute || cityFromRoute
              ? 'From calculator. You can change it below to view another area.'
              : 'Select state and city to see local brackets and sources.'}
          </p>
          <div className="flex flex-wrap gap-3">
            <div>
              <label className="sr-only">State</label>
              <select
                value={stateCode}
                onChange={(e) => {
                  setStateCode(e.target.value)
                  setCityId('')
                }}
                className="rounded border border-zinc-600 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 [appearance:none] [background-image:url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%239ca3af%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] [background-position:right_0.5rem_center] [background-size:1rem] [background-repeat:no-repeat] [padding-right:1.75rem]"
              >
                <option value="">Select state</option>
                {US_STATES.map(({ code, name }) => (
                  <option key={code} value={code}>{name}</option>
                ))}
              </select>
            </div>
            {citiesInState.length > 0 && (
              <div>
                <label className="sr-only">City</label>
                <select
                  value={cityId}
                  onChange={(e) => setCityId(e.target.value)}
                  className="rounded border border-zinc-600 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 [appearance:none] [background-image:url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%239ca3af%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] [background-position:right_0.5rem_center] [background-size:1rem] [background-repeat:no-repeat] [padding-right:1.75rem]"
                >
                  <option value="">No city tax</option>
                  {citiesInState.map(({ id, name }) => (
                    <option key={id} value={id}>{name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <Section
            title="Income tier & class labels"
            source={undefined}
          >
            <p className="text-zinc-400">
              The helper text under W-2 income (“Below typical NYC income”, “Middle class”, etc.) uses location-specific medians and percentiles plus national class thresholds. Sources:
            </p>
            <ul className="mt-2 list-inside list-disc space-y-0.5 text-zinc-400">
              {INCOME_TIER_SOURCES.map((s, i) => (
                <li key={i}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-zinc-400 underline hover:text-zinc-200">
                    {s.name}
                  </a>
                </li>
              ))}
            </ul>
          </Section>

          <Section title="You could have bought" source={undefined}>
            <p className="text-zinc-400">
              Rent (studio, 1BR, 2BR), car payments, health insurance, groceries, and retirement growth use location data and national benchmarks. Sources:
            </p>
            <ul className="mt-2 list-inside list-disc space-y-0.5 text-zinc-400">
              {YOU_COULD_HAVE_BOUGHT_SOURCES.map((s, i) => (
                <li key={i}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-zinc-400 underline hover:text-zinc-200">
                    {s.name}
                  </a>
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Federal income tax (2025)" source={FEDERAL_SOURCE}>
            <p className="text-zinc-500">Single:</p>
            <ul className="list-inside list-disc space-y-0.5 text-zinc-400">
              {federal.single.map((b, i) => (
                <li key={i}>{formatMax(b.max)} → {b.rate}%</li>
              ))}
            </ul>
            <p className="mt-2 text-zinc-500">Married filing jointly:</p>
            <ul className="list-inside list-disc space-y-0.5 text-zinc-400">
              {federal.married.map((b, i) => (
                <li key={i}>{formatMax(b.max)} → {b.rate}%</li>
              ))}
            </ul>
          </Section>

          <Section title="Payroll (FICA) – 2025" source={FICA_SOURCE}>
            <ul className="list-inside list-disc space-y-0.5 text-zinc-400">
              <li>Social Security: 6.2% on wages up to $176,100</li>
              <li>Medicare: 1.45% on all wages</li>
              <li>Additional Medicare: 0.9% on wages over $200,000 (single) / $250,000 (married)</li>
            </ul>
          </Section>

          {stateCode && (
            <Section
              title={stateInfo?.noIncomeTax ? `${US_STATES.find(s => s.code === stateCode)?.name ?? stateCode} (no state income tax)` : `State income tax – ${US_STATES.find(s => s.code === stateCode)?.name ?? stateCode}`}
              source={STATE_SOURCES[stateCode]}
            >
              {stateInfo?.noIncomeTax ? (
                <p className="text-zinc-500">No state income tax.</p>
              ) : (
                <>
                  {stateDed && (stateDed.single > 0 || stateDed.married > 0) && (
                    <p className="text-zinc-400">
                      Standard deduction (2024): Single ${stateDed.single.toLocaleString()}, Married ${stateDed.married.toLocaleString()}. Applied when “Apply state standard deduction” is checked in the calculator.
                    </p>
                  )}
                  {stateInfo?.brackets ? (
                    <ul className="list-inside list-disc space-y-0.5 text-zinc-400">
                      {stateInfo.brackets.map((b, i) => (
                        <li key={i}>{formatMax(b.max)} → {b.rate}%</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-zinc-500">See source for current rates.</p>
                  )}
                </>
              )}
            </Section>
          )}

          <Section title="State standard deductions (2024)" source={STATE_STANDARD_DEDUCTIONS_SOURCE}>
            <p className="text-zinc-400">
              State standard deduction amounts vary by state and filing status. Many states use the federal amounts or offer no standard deduction. This app uses Tax Foundation 2024 data; amounts may be updated for inflation by your state.
            </p>
          </Section>

          {cityId && cityInfo && (
            <Section title={`City tax – ${cityInfo.name}`} source={cityId === 'NYC' ? NYC_SOURCE : undefined}>
              {cityInfo.rate != null ? (
                <p className="text-zinc-400">Flat rate: {cityInfo.rate}%</p>
              ) : cityInfo.brackets?.single ? (
                <ul className="list-inside list-disc space-y-0.5 text-zinc-400">
                  {cityInfo.brackets.single.map((b, i) => (
                    <li key={i}>{formatMax(b.max)} → {b.rate}%</li>
                  ))}
                </ul>
              ) : null}
              {!STATE_SOURCES[stateCode] && stateCode && (
                <p className="mt-2 text-zinc-500">State/city source: see your state tax agency for local rates.</p>
              )}
            </Section>
          )}

          {sdiInfo && (
            <Section
              title={`State disability – ${US_STATES.find(s => s.code === stateCode)?.name ?? stateCode}`}
              source={STATE_DISABILITY_SOURCES[stateCode]}
            >
              <ul className="list-inside list-disc space-y-0.5 text-zinc-400">
                <li>{sdiInfo.name}: {sdiInfo.rate}%</li>
                {sdiInfo.wageBase != null && <li>Wage base: ${sdiInfo.wageBase.toLocaleString()}</li>}
                {sdiInfo.maxWithholding != null && <li>Max withholding: ${sdiInfo.maxWithholding.toFixed(2)}</li>}
              </ul>
            </Section>
          )}
        </div>

        <p className="mt-8 text-center text-xs text-zinc-500">
          Estimates only. Not professional tax or legal advice.
        </p>
      </div>
    </div>
  )
}
