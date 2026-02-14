import { useEffect } from 'react'

declare global {
  interface Window {
    adsbygoogle: unknown[]
  }
}

interface AdProps {
  /** AdSense client ID (e.g. ca-pub-XXXXXXXXXXXXXXXX). */
  clientId: string
  /** Ad unit slot ID from AdSense. */
  slotId: string
  /** Optional: 'auto' | 'rectangle' | 'horizontal' | 'vertical'. Default 'auto'. */
  format?: string
  /** Responsive full width. Default true. */
  fullWidthResponsive?: boolean
  className?: string
  /** When true, only render on larger viewports (e.g. above-the-fold ad). */
  desktopOnly?: boolean
  /** When true, use AdSense test mode (data-adtest="on"); test impressions don't count. */
  testMode?: boolean
  /** When true, wrap in a dark container to match dark pages; may hint for darker creatives (AdSense doesn't guarantee). */
  preferDark?: boolean
}

export default function Ad({
  clientId,
  slotId,
  format = 'auto',
  fullWidthResponsive = true,
  className = '',
  desktopOnly = false,
  testMode = false,
}: AdProps) {
  useEffect(() => {
    if (!clientId || clientId.includes('XXXXXXXX') || !slotId) return
    try {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch {
      // AdSense may block in dev or ad blockers
    }
  }, [clientId, slotId])

  if (!clientId || !slotId || clientId.includes('XXXXXXXX') || slotId.includes('XXXXXXXX')) return null

  return (
    <div className={`${desktopOnly ? 'hidden xl:block' : ''} ${className}`}>
      <ins
        className="adsbygoogle block"
        data-ad-client={clientId}
        data-ad-slot={slotId}
        data-ad-format={format}
        data-full-width-responsive={fullWidthResponsive ? 'true' : undefined}
        {...(testMode ? { 'data-adtest': 'on' } : {})}
      />
    </div>
  )
}
