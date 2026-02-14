import type { FilingStatus } from '../App'

const STANDARD_DEDUCTION_2025: Record<FilingStatus, number> = {
  single: 15_750,
  married: 31_500,
}

interface StandardDeductionCheckboxProps {
  checked: boolean
  onChange: (checked: boolean) => void
  filingStatus: FilingStatus
}

export default function StandardDeductionCheckbox({
  checked,
  onChange,
  filingStatus,
}: StandardDeductionCheckboxProps) {
  return (
    <div className="flex items-start gap-3">
      <input
        type="checkbox"
        id="standard-deduction"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-4 w-4 rounded border-zinc-600 bg-zinc-800 text-zinc-400 focus:ring-zinc-500"
      />
      <label htmlFor="standard-deduction" className="cursor-pointer text-sm text-zinc-300">
        Apply federal standard deduction (${STANDARD_DEDUCTION_2025[filingStatus].toLocaleString()} for 2025)
      </label>
    </div>
  )
}
