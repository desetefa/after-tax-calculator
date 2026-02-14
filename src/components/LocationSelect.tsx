import { useState, useMemo } from 'react'
import { US_STATES } from '../data/states'
import { getBrowserLocation, getLocationFromCoords } from '../lib/geolocation'
import { getCitiesByState } from '../lib/cityTax'

interface LocationSelectProps {
  stateCode: string
  cityId: string
  filingStatus: 'single' | 'married'
  onChangeState: (state: string) => void
  onChangeCity: (city: string) => void
  onChangeFilingStatus: (status: 'single' | 'married') => void
}

export default function LocationSelect({
  stateCode,
  cityId,
  filingStatus,
  onChangeState,
  onChangeCity,
  onChangeFilingStatus,
}: LocationSelectProps) {
  const [locationError, setLocationError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const citiesInState = useMemo(() => getCitiesByState(stateCode), [stateCode])

  async function handleUseLocation() {
    setLocationError(null)
    setLoading(true)
    try {
      const coords = await getBrowserLocation()
      if (!coords) {
        setLocationError('Location unavailable. Please select state and city manually.')
        return
      }
      const loc = await getLocationFromCoords(coords.lat, coords.lon)
      if (loc) {
        onChangeState(loc.stateCode)
        if (loc.cityId) onChangeCity(loc.cityId)
        else onChangeCity('')
      } else {
        setLocationError('Could not detect location. Please select manually.')
      }
    } catch {
      setLocationError('Location failed. Please select state and city manually.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-400">
          State
        </label>
        <div className="flex gap-2">
          <select
            value={stateCode}
            onChange={(e) => onChangeState(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-zinc-100 focus:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600 [appearance:none] [background-image:url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%239ca3af%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] [background-position:right_0.75rem_center] [background-size:1.25rem] [background-repeat:no-repeat] [padding-right:2rem]"
          >
            <option value="">Select state</option>
            {US_STATES.map(({ code, name }) => (
              <option key={code} value={code}>
                {name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleUseLocation}
            disabled={loading}
            className="shrink-0 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-300 hover:bg-zinc-700 disabled:opacity-50"
          >
            {loading ? '…' : 'Use my location'}
          </button>
        </div>
        {locationError && (
          <p className="mt-1 text-xs text-amber-500/90">{locationError}</p>
        )}
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-400">
          City (local income tax)
        </label>
        <select
          value={stateCode && citiesInState.length > 0 ? cityId : ''}
          onChange={(e) => onChangeCity(e.target.value)}
          disabled={!stateCode || citiesInState.length === 0}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-zinc-100 focus:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600 disabled:opacity-60 [appearance:none] [background-image:url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%239ca3af%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] [background-position:right_0.75rem_center] [background-size:1.25rem] [background-repeat:no-repeat] [padding-right:2rem]"
        >
          <option value="">None</option>
          {citiesInState.map(({ id, name }) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-400">
          Filing status
        </label>
        <select
          value={filingStatus}
          onChange={(e) => onChangeFilingStatus(e.target.value as 'single' | 'married')}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-zinc-100 focus:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600 [appearance:none] [background-image:url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%239ca3af%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] [background-position:right_0.75rem_center] [background-size:1.25rem] [background-repeat:no-repeat] [padding-right:2rem]"
        >
          <option value="single">Single</option>
          <option value="married">Married filing jointly</option>
        </select>
      </div>
    </div>
  )
}
