import { US_STATES } from '../data/states'
import cityTaxRates from '../data/cityTaxRates.json'

const STATE_NAME_TO_CODE = Object.fromEntries(
  US_STATES.map(({ code, name }) => [name.toUpperCase(), code])
)

const CITY_NAMES_TO_ID: Record<string, string> = {}
for (const [id, c] of Object.entries(cityTaxRates as Record<string, { name: string }>)) {
  const n = (c.name ?? '').toUpperCase().trim()
  if (n) CITY_NAMES_TO_ID[n] = id
  if (id === 'NYC') {
    CITY_NAMES_TO_ID['NEW YORK'] = id
    CITY_NAMES_TO_ID['NEW YORK CITY'] = id
  }
}

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/reverse'

export interface LocationFromCoords {
  stateCode: string
  cityId: string | null
}

export function getLocationFromCoords(lat: number, lon: number): Promise<LocationFromCoords | null> {
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
    format: 'jsonv2',
    addressdetails: '1',
  })
  return fetch(`${NOMINATIM_URL}?${params}`, {
    headers: {
      'Accept-Language': 'en',
      'User-Agent': 'AfterTaxCalculator/1.0 (https://github.com; contact optional)',
    },
  })
    .then((r) => {
      if (!r.ok) throw new Error('Geocoding failed')
      return r.json()
    })
    .then((data: { address?: { state?: string; country_code?: string; city?: string; town?: string; village?: string; municipality?: string } }) => {
      const address = data?.address
      if (!address || (address.country_code ?? '').toUpperCase() !== 'US') return null
      const stateName = (address.state ?? '').trim()
      if (!stateName) return null
      const upper = stateName.toUpperCase()
      const stateCode = STATE_NAME_TO_CODE[upper] ?? US_STATES.find((s) => s.name.toUpperCase() === upper || s.code === upper)?.code ?? null
      if (!stateCode) return null
      const cityRaw = (address.city ?? address.town ?? address.village ?? address.municipality ?? '').trim()
      const cityId = cityRaw ? (CITY_NAMES_TO_ID[cityRaw.toUpperCase()] ?? null) : null
      return { stateCode, cityId }
    })
    .catch(() => null)
}

export function getStateCodeFromCoords(lat: number, lon: number): Promise<string | null> {
  return getLocationFromCoords(lat, lon).then((loc) => loc?.stateCode ?? null)
}

export function getBrowserLocation(): Promise<{ lat: number; lon: number } | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null)
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => resolve(null),
      { timeout: 10000, maximumAge: 300000 }
    )
  })
}
