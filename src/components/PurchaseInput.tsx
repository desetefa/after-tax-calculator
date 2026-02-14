function formatCurrency(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n)
}

interface PurchaseInputProps {
  amount: number
  onChange: (amount: number) => void
  salesTax?: number
  totalWithTax?: number
}

export default function PurchaseInput({
  amount,
  onChange,
  salesTax = 0,
  totalWithTax,
}: PurchaseInputProps) {
  const showTotal = amount > 0 && totalWithTax != null
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-zinc-400">
        Purchase (sales tax)
      </label>
      <div className="relative flex items-center">
        <span className="pointer-events-none absolute left-3 text-zinc-500">$</span>
        <input
          type="number"
          min={0}
          step={0.01}
          value={amount === 0 ? '' : amount}
          onChange={(e) => {
            const raw = String(e.target.value).replace(/,/g, '')
            const n = Number(raw)
            onChange(Number.isFinite(n) ? n : 0)
          }}
          placeholder="0"
          className="w-full rounded-lg border border-zinc-700 bg-zinc-800 py-2.5 pl-7 pr-9 text-zinc-100 placeholder-zinc-500 focus:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600"
        />
        {amount ? (
          <button
            type="button"
            onClick={() => onChange(0)}
            aria-label="Clear purchase amount"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-zinc-500 hover:bg-zinc-700 hover:text-zinc-300"
          >
            ×
          </button>
        ) : null}
      </div>
      {showTotal && (
        <p className="mt-1.5 text-xs text-zinc-500">
          <span className="text-red-400">Sales tax: {formatCurrency(salesTax)}</span>
          {' · '}
          <span className="text-emerald-400">Total: {formatCurrency(totalWithTax)}</span>
        </p>
      )}
    </div>
  )
}
