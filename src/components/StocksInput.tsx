const SLIDER_MAX = 1_000_000
const SLIDER_STEP = 5_000

interface StocksInputProps {
  amount: number
  shortTermPercent: number
  onChangeAmount: (amount: number) => void
  onChangeShortTermPercent: (percent: number) => void
}

export default function StocksInput({
  amount,
  shortTermPercent,
  onChangeAmount,
  onChangeShortTermPercent,
}: StocksInputProps) {
  const longTermPercent = 100 - shortTermPercent
  const sliderValue = Math.min(
    Math.max(0, Math.round(amount / SLIDER_STEP) * SLIDER_STEP),
    SLIDER_MAX
  )

  const handleAmountSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChangeAmount(Number(e.target.value))
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-zinc-400">
        Capital gains
      </label>

      {/* Short-term / long-term split — above the amount input */}
      <div>
        <div className="mb-1 flex justify-between text-xs text-zinc-400">
          <span>{shortTermPercent}% short-term</span>
          <span>{longTermPercent}% long-term</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={100 - shortTermPercent}
          onChange={(e) => onChangeShortTermPercent(100 - Number(e.target.value))}
          className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-zinc-700 accent-zinc-400 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-zinc-400 [&::-webkit-slider-thumb]:shadow [&::-webkit-slider-thumb]:transition-[transform] [&::-webkit-slider-thumb]:hover:scale-110"
        />
      </div>

      {/* Stock amount input */}
      <div className="relative flex items-center">
        <span className="pointer-events-none absolute left-3 text-zinc-500">$</span>
        <input
          type="number"
          min={0}
          step={100}
          value={amount === 0 ? '' : amount}
          onChange={(e) => {
            const raw = String(e.target.value).replace(/,/g, '')
            const n = Number(raw)
            onChangeAmount(Number.isFinite(n) ? n : 0)
          }}
          placeholder="0"
          className="w-full rounded-lg border border-zinc-700 bg-zinc-800 py-2.5 pl-7 pr-9 text-zinc-100 placeholder-zinc-500 focus:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600"
        />
        {amount ? (
          <button
            type="button"
            onClick={() => onChangeAmount(0)}
            aria-label="Clear capital gains amount"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-zinc-500 hover:bg-zinc-700 hover:text-zinc-300"
          >
            ×
          </button>
        ) : null}
      </div>

      {/* Amount slider — below the input */}
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={0}
          max={SLIDER_MAX}
          step={SLIDER_STEP}
          value={sliderValue}
          onChange={handleAmountSliderChange}
          aria-label="Capital gains amount"
          className="h-2 w-full flex-1 cursor-pointer appearance-none rounded-lg bg-zinc-700 accent-zinc-400 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-zinc-400 [&::-webkit-slider-thumb]:shadow [&::-webkit-slider-thumb]:transition-[transform] [&::-webkit-slider-thumb]:hover:scale-110"
        />
        <span className="min-w-[4.5rem] text-right text-xs text-zinc-500">
          {sliderValue >= 1_000_000
            ? `$${(sliderValue / 1_000_000).toFixed(1)}M`
            : sliderValue >= 1000
              ? `$${(sliderValue / 1000).toFixed(0)}k`
              : `$${Math.round(sliderValue)}`}
        </span>
      </div>
    </div>
  )
}
