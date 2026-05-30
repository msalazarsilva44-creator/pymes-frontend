import { Landmark, Bitcoin, DollarSign, Send } from 'lucide-react'

type MetodoIcon = typeof Landmark

const METHOD_META: Record<string, { label: string; icon: MetodoIcon }> = {
  banco: { label: 'Banco', icon: Landmark },
  binance: { label: 'Binance', icon: Bitcoin },
  paypal: { label: 'PayPal', icon: DollarSign },
  zelle: { label: 'Zelle', icon: Send }
}

interface PaymentMethodTabsProps {
  metodos: { tipo: string; nombre: string }[]
  value: string
  onChange: (tipo: string) => void
}

export function PaymentMethodTabs({ metodos, value, onChange }: PaymentMethodTabsProps) {
  return (
    <div role="tablist" aria-label="Método de pago" className="flex flex-wrap gap-2">
      {metodos.map((metodo) => {
        const meta = METHOD_META[metodo.tipo] || { label: metodo.nombre, icon: Landmark }
        const Icon = meta.icon
        const isActive = value === metodo.tipo
        return (
          <button
            key={metodo.tipo}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(metodo.tipo)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
              isActive
                ? 'bg-brand-navy text-white shadow-sm'
                : 'bg-brand-cyanlt/40 text-brand-deep/60 hover:bg-brand-cyanlt/70 hover:text-brand-navy'
            }`}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {meta.label}
          </button>
        )
      })}
    </div>
  )
}
