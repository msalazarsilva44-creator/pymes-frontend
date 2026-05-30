import { Check, Star } from 'lucide-react'
import type { Plan } from './types'

interface PlanSelectorProps {
  planes: Plan[]
  planId: number | null
  onSelectPlan: (id: number) => void
  tipoPeriodo: 'mensual' | 'anual'
  onChangePeriodo: (periodo: 'mensual' | 'anual') => void
}

export function PlanSelector({
  planes,
  planId,
  onSelectPlan,
  tipoPeriodo,
  onChangePeriodo
}: PlanSelectorProps) {
  const selectedPlan = planes.find((p) => p.id === planId) || null
  const ahorroSeleccionado = selectedPlan
    ? Number(selectedPlan.precio_mensual) * 12 - Number(selectedPlan.precio_anual)
    : 0
  const porcentajeAhorro =
    selectedPlan && Number(selectedPlan.precio_mensual) > 0
      ? Math.round((ahorroSeleccionado / (Number(selectedPlan.precio_mensual) * 12)) * 100)
      : 0

  const isSingle = planes.length === 1

  return (
    <section className="rounded-2xl border border-brand-cyan/15 bg-white p-6 shadow-[0_2px_16px_rgba(14,58,95,0.06)]">
      <h2 className="font-heading text-lg font-semibold text-brand-navy">Seleccionar plan</h2>

      {/* Toggle periodo */}
      <div className="mt-4 flex flex-col items-center gap-2">
        <div className="inline-flex rounded-xl bg-brand-cyanlt/60 p-1">
          <button
            type="button"
            onClick={() => onChangePeriodo('mensual')}
            className={`rounded-lg px-6 py-2 text-sm font-semibold transition-all ${
              tipoPeriodo === 'mensual' ? 'bg-brand-cyan text-white shadow-sm' : 'text-brand-deep/60 hover:text-brand-navy'
            }`}
          >
            Mensual
          </button>
          <button
            type="button"
            onClick={() => onChangePeriodo('anual')}
            className={`rounded-lg px-6 py-2 text-sm font-semibold transition-all ${
              tipoPeriodo === 'anual' ? 'bg-brand-cyan text-white shadow-sm' : 'text-brand-deep/60 hover:text-brand-navy'
            }`}
          >
            Anual
          </button>
        </div>
        {tipoPeriodo === 'anual' && ahorroSeleccionado > 0 && (
          <p className="text-xs font-semibold text-emerald-600">
            Ahorras ${ahorroSeleccionado.toFixed(2)}/año{porcentajeAhorro > 0 ? ` (${porcentajeAhorro}%)` : ''}
          </p>
        )}
      </div>

      {/* Tarjetas de plan */}
      <div
        className={
          isSingle
            ? 'mt-5 flex justify-center'
            : 'mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3'
        }
      >
        {planes.map((plan) => {
          const isSelected = planId === plan.id
          const precio = Number(tipoPeriodo === 'mensual' ? plan.precio_mensual : plan.precio_anual)
          const ahorroAnual = Number(plan.precio_mensual) * 12 - Number(plan.precio_anual)

          return (
            <button
              key={plan.id}
              type="button"
              onClick={() => onSelectPlan(plan.id)}
              aria-pressed={isSelected}
              className={`relative w-full max-w-sm rounded-xl border-2 p-5 text-left transition-all ${
                isSelected
                  ? 'border-brand-navy shadow-lg'
                  : plan.destacado
                  ? 'border-brand-cyan/60 hover:border-brand-cyan'
                  : 'border-brand-cyan/15 hover:border-brand-cyan/40 hover:shadow-sm'
              }`}
            >
              {plan.destacado && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-cyan px-3 py-0.5 text-xs font-bold text-white shadow">
                  <Star className="mr-1 inline h-3 w-3 fill-white" aria-hidden="true" />
                  Más popular
                </span>
              )}

              <h3 className="font-heading text-lg font-semibold text-brand-navy">{plan.nombre}</h3>
              {plan.descripcion && <p className="mt-0.5 text-xs text-brand-deep/50">{plan.descripcion}</p>}

              <div className="mt-3 mb-4">
                <span className="text-3xl font-bold text-brand-navy">${precio}</span>
                <span className="ml-1 text-sm text-brand-deep/50">USD/{tipoPeriodo === 'mensual' ? 'mes' : 'año'}</span>
                {tipoPeriodo === 'anual' && ahorroAnual > 0 && (
                  <p className="mt-1 text-xs font-semibold text-emerald-600">Ahorras ${ahorroAnual.toFixed(2)}/año</p>
                )}
              </div>

              {plan.caracteristicas && plan.caracteristicas.length > 0 && (
                <ul className="space-y-1.5">
                  {plan.caracteristicas.map((c, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-brand-deep/70">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-cyan" aria-hidden="true" />
                      {c}
                    </li>
                  ))}
                </ul>
              )}

              {isSelected && (
                <span className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-brand-navy">
                  <Check className="h-4 w-4 text-white" aria-hidden="true" />
                </span>
              )}
            </button>
          )
        })}
      </div>
    </section>
  )
}
