import { useState } from 'react'
import type { FilingStatus } from '../App'
import stateDeductions from '../data/stateDeductions.json'

const deductions = stateDeductions as Record<string, { single: number; married: number }>

interface StandardDeductionRowProps {
  stateCode: string
  filingStatus: FilingStatus
  useStateStandardDeduction: boolean
  useStandardDeduction: boolean
  onChangeState: (checked: boolean) => void
  onChangeFederal: (checked: boolean) => void
}

export default function StandardDeductionRow({
  stateCode,
  filingStatus,
  useStateStandardDeduction,
  useStandardDeduction,
  onChangeState,
  onChangeFederal,
}: StandardDeductionRowProps) {
  const [showStateMessage, setShowStateMessage] = useState(false)
  const stateAmount = stateCode ? (deductions[stateCode]?.[filingStatus] ?? 0) : 0
  const stateDisabled = !stateCode || stateAmount === 0

  const handleStateClick = (e: React.MouseEvent) => {
    if (stateDisabled) {
      e.preventDefault()
      setShowStateMessage(true)
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
        <span className="text-zinc-400">Apply Standard Deduction:</span>
        <label
          className="flex cursor-pointer items-center gap-1.5 text-zinc-300"
          onClick={stateDisabled ? handleStateClick : undefined}
        >
          <span>State</span>
          <input
            type="checkbox"
            checked={stateDisabled ? false : useStateStandardDeduction}
            onChange={(e) => onChangeState(e.target.checked)}
            disabled={stateDisabled}
            className={`h-4 w-4 rounded border-zinc-600 bg-zinc-800 text-zinc-400 focus:ring-zinc-500 disabled:opacity-50 ${stateDisabled ? 'pointer-events-none' : ''}`}
          />
        </label>
        <label className="flex cursor-pointer items-center gap-1.5 text-zinc-300">
          <span>Federal</span>
          <input
            type="checkbox"
            checked={useStandardDeduction}
            onChange={(e) => onChangeFederal(e.target.checked)}
            className="h-4 w-4 rounded border-zinc-600 bg-zinc-800 text-zinc-400 focus:ring-zinc-500"
          />
        </label>
      </div>
      {showStateMessage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="state-deduction-message"
        >
          <div
            className="absolute inset-0 bg-zinc-950/70"
            onClick={() => setShowStateMessage(false)}
            aria-hidden="true"
          />
          <div className="relative rounded-xl border border-zinc-700 bg-zinc-900 px-5 py-4 shadow-xl max-w-sm">
            <p id="state-deduction-message" className="text-sm text-zinc-200">
              Select a state to apply the state standard deduction.
            </p>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setShowStateMessage(false)}
                className="rounded-lg bg-zinc-700 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-600"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
