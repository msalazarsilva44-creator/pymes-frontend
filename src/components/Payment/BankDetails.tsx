import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

interface DetailRow {
  label: string
  value: string
  copyable?: boolean
}

const DETAILS: Record<string, { title: string; rows: DetailRow[] }> = {
  banco: {
    title: 'Transferencia Bancaria',
    rows: [
      { label: 'Banco', value: 'Banco Provincial' },
      { label: 'Tipo', value: 'Cuenta Corriente' },
      { label: 'Número de Cuenta', value: '0108-1234-56789-0001234', copyable: true },
      { label: 'RIF', value: 'J-12345678-9', copyable: true },
      { label: 'Titular', value: 'ServiLocal C.A.', copyable: true }
    ]
  },
  binance: {
    title: 'Binance Pay',
    rows: [
      { label: 'Binance ID', value: '123456789', copyable: true },
      { label: 'Email Binance', value: 'pagos@servilocal.com', copyable: true },
      { label: 'Criptomonedas Aceptadas', value: 'USDT, BTC, BNB' }
    ]
  },
  paypal: {
    title: 'PayPal',
    rows: [
      { label: 'Email PayPal', value: 'pagos@servilocal.com', copyable: true },
      { label: 'Tipo de Cuenta', value: 'Cuenta de Negocios' },
      { label: 'Nombre', value: 'ServiLocal' }
    ]
  },
  zelle: {
    title: 'Zelle',
    rows: [
      { label: 'Email Zelle', value: 'pagos@servilocal.com', copyable: true },
      { label: 'Nombre Registrado', value: 'ServiLocal LLC' },
      { label: 'País', value: 'Estados Unidos' }
    ]
  }
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // Si clipboard falla, no rompemos la UI
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? `${label} copiado` : `Copiar ${label}`}
      className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-brand-cyan transition hover:bg-brand-cyan/10 focus:outline-none focus:ring-2 focus:ring-brand-cyan/40"
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5" aria-hidden="true" />
          Copiado
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5" aria-hidden="true" />
          Copiar
        </>
      )}
    </button>
  )
}

interface BankDetailsProps {
  metodoPago: string
}

export function BankDetails({ metodoPago }: BankDetailsProps) {
  const detail = DETAILS[metodoPago]
  if (!detail) return null

  return (
    <div className="rounded-xl border border-brand-cyan/20 bg-brand-cyanlt/40 p-5">
      <h3 className="font-heading text-base font-semibold text-brand-navy">{detail.title}</h3>
      <dl className="mt-3 divide-y divide-brand-cyan/15">
        {detail.rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-3 py-2">
            <div className="min-w-0">
              <dt className="text-xs font-medium text-brand-deep/50">{row.label}</dt>
              <dd className="truncate text-sm font-semibold text-brand-deep">{row.value}</dd>
            </div>
            {row.copyable && <CopyButton value={row.value} label={row.label} />}
          </div>
        ))}
      </dl>
    </div>
  )
}
