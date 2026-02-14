import type { FilingStatus } from '../App'
import stateDeductions from '../data/stateDeductions.json'

const deductions = stateDeductions as Record<string, { single: number; married: number }>

interface StateStandardDeductionCheckboxProps {
  checked: boolean
  onChange: (checked: boolean) => void
  stateCode: string
  filingStatus: FilingStatus
}

export default function StateStandardDeductionCheckbox({
  checked,
  onChange,
  stateCode,
  filingStatus,
}: StateStandardDeductionCheckboxProps) {
  const amount = stateCode ? (deductions[stateCode]?.[filingStatus] ?? 0) : 0
  const disabled = !stateCode || amount === 0

  return (
    <div className="flex items-start gap-3">
      <input
        type="checkbox"
        id="state-standard-deduction"
        checked={disabled ? false : checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="mt-1 h-4 w-4 rounded border-zinc-600 bg-zinc-800 text-zinc-400 focus:ring-zinc-500 disabled:opacity-50"
      />
      <label
        htmlFor="state-standard-deduction"
        className={`cursor-pointer text-sm ${disabled ? 'text-zinc-500' : 'text-zinc-300'}`}
      >
        {disabled && !stateCode
          ? 'Apply state standard deduction (select a state)'
          : disabled && stateCode
            ? `No state standard deduction for this state`
            : `Apply state standard deduction ($${amount.toLocaleString()} for 2024)`}
      </label>
    </div>
  )
}
