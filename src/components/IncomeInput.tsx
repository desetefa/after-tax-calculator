import {
  toYearly,
  fromYearly,
  roundAmountForPeriod,
  useTwoDecimalStep,
  INCOME_SLIDER_MAX_YEARLY,
  INCOME_SLIDER_STEP,
  formatYearlyLabel,
} from '../lib/periods'
import { getIncomeTierLines } from '../lib/incomeTierLabels'
import type { FilingStatus } from '../App'

type Period = 'yearly' | 'weekly' | 'daily' | 'hourly'

interface IncomeInputProps {
  amount: number
  period: Period
  onChangeAmount: (amount: number) => void
  onChangePeriod: (period: Period) => void
  rightOfLabel?: React.ReactNode
  stateCode?: string
  cityId?: string
  filingStatus?: FilingStatus
}

export default function IncomeInput({
  amount,
  period,
  onChangeAmount,
  onChangePeriod,
  rightOfLabel,
  stateCode = '',
  cityId = '',
  filingStatus = 'single',
}: IncomeInputProps) {
  const yearly = toYearly(amount, period)
  const tierLines = getIncomeTierLines(yearly, stateCode, cityId, filingStatus)
  const sliderValue = Math.min(Math.max(0, Math.round(yearly / INCOME_SLIDER_STEP) * INCOME_SLIDER_STEP), INCOME_SLIDER_MAX_YEARLY)

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const yearlyValue = Number(e.target.value)
    onChangeAmount(fromYearly(yearlyValue, period))
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <label className="text-sm font-medium text-zinc-400">
          W-2 income
        </label>
        {rightOfLabel}
      </div>
      <div className="flex gap-2">
        <div className="relative flex flex-1 items-center">
          <span className="pointer-events-none absolute left-3 text-zinc-500">$</span>
          <input
            type="number"
            min={0}
            step={useTwoDecimalStep(period) ? 0.01 : 100}
            value={amount === 0 ? '' : roundAmountForPeriod(amount, period)}
            onChange={(e) => {
              const raw = String(e.target.value).replace(/,/g, '')
              const n = Number(raw)
              if (!Number.isFinite(n)) {
                onChangeAmount(0)
                return
              }
              onChangeAmount(roundAmountForPeriod(n, period))
            }}
            placeholder="0"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 py-2.5 pl-7 pr-9 text-zinc-100 placeholder-zinc-500 focus:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600"
          />
          {amount ? (
            <button
              type="button"
              onClick={() => onChangeAmount(0)}
              aria-label="Clear income"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-zinc-500 hover:bg-zinc-700 hover:text-zinc-300"
            >
              ×
            </button>
          ) : null}
        </div>
        <select
          value={period}
          onChange={(e) => onChangePeriod(e.target.value as Period)}
          className="rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-zinc-100 focus:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600 [appearance:none] [background-image:url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%239ca3af%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] [background-position:right_0.75rem_center] [background-size:1.25rem] [background-repeat:no-repeat] [padding-right:2rem]"
        >
          <option value="yearly">Yearly</option>
          <option value="weekly">Weekly</option>
          <option value="daily">Daily</option>
          <option value="hourly">Hourly</option>
        </select>
      </div>
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={0}
          max={INCOME_SLIDER_MAX_YEARLY}
          step={INCOME_SLIDER_STEP}
          value={sliderValue}
          onChange={handleSliderChange}
          aria-label="Income (yearly equivalent)"
          className="h-2 w-full flex-1 cursor-pointer appearance-none rounded-lg bg-zinc-700 accent-zinc-400 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-zinc-400 [&::-webkit-slider-thumb]:shadow [&::-webkit-slider-thumb]:transition-[transform] [&::-webkit-slider-thumb]:hover:scale-110"
        />
        <span className="min-w-[4.5rem] text-right text-xs text-zinc-500">
          {formatYearlyLabel(yearly)}
        </span>
      </div>
      <div className="min-h-[2rem]">
        {tierLines ? (
          <p className="text-xs text-zinc-500">
            {tierLines.line1}
            <br />
            {tierLines.line2}
          </p>
        ) : null}
      </div>
    </div>
  )
}
