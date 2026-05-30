import { ShieldCheck } from 'lucide-react'
import type { Plan } from './types'

interface OrderSummaryProps {
  selectedPlan: Plan | null
  tipoPeriodo: 'mensual' | 'anual'
  precioTotal: number
}

export function OrderSummary({ selectedPlan, tipoPeriodo, precioTotal }: OrderSummaryProps) {
  return (
    <aside className="rounded-2xl border border-brand-cyan/15 bg-white p-6 shadow-[0_2px_16px_rgba(14,58,95,0.06)] lg:sticky lg:top-6">
      <h2 className="font-heading text-lg font-semibold text-brand-navy">Resumen de orden</h2>

      <div className="mt-4 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-brand-deep/60">Plan</span>
          <span className="font-semibold text-brand-deep">{selectedPlan?.nombre ?? '—'}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-brand-deep/60">Periodo</span>
          <span className="font-semibold text-brand-deep">{tipoPeriodo === 'mensual' ? 'Mensual' : 'Anual'}</span>
        </div>
      </div>

      <div className="mt-5 border-t border-brand-cyan/15 pt-4">
        <p className="text-xs font-medium uppercase tracking-wide text-brand-deep/50">Total a pagar</p>
        <p className="mt-1 font-heading text-3xl font-bold text-brand-navy">
          ${precioTotal.toFixed(2)} <span className="text-base font-semibold text-brand-deep/50">USD</span>
        </p>
      </div>

      <div className="mt-5 flex items-start gap-2 rounded-lg bg-brand-cyanlt/50 p-3">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand-cyan" aria-hidden="true" />
        <p className="text-xs text-brand-deep/70">Tu solicitud será verificada en 24-48h.</p>
      </div>
    </aside>
  )
}
