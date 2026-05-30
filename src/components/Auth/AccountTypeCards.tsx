import { Building2, User, CheckCircle2 } from 'lucide-react'
import { motion } from 'framer-motion'

export type AccountType = 'natural' | 'empresa'

interface AccountTypeCardsProps {
  value: AccountType | null
  onChange: (value: AccountType) => void
}

const cards: Array<{
  type: AccountType
  title: string
  description: string
  benefits: string[]
  icon: typeof Building2
  accent: string
}> = [
  {
    type: 'natural',
    title: 'Persona natural',
    description: 'Compra, descubre y gestiona tus favoritos',
    benefits: ['Acceso a negocios verificados', 'Panel personalizado', 'Alertas de novedades'],
    icon: User,
    accent: 'from-brand-cyan/20 via-white to-brand-cyan/10'
  },
  {
    type: 'empresa',
    title: 'Empresa o emprendimiento',
    description: 'Publica tus servicios y crece con MERCAROF',
    benefits: ['Panel para gestionar clientes', 'Mayor visibilidad en el marketplace', 'Recibe reseñas verificadas'],
    icon: Building2,
    accent: 'from-brand-star/10 via-white to-brand-star/5'
  }
]

export function AccountTypeCards({ value, onChange }: AccountTypeCardsProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {cards.map((card) => {
        const Icon = card.icon
        const selected = value === card.type
        return (
          <motion.button
            key={card.type}
            type="button"
            whileTap={{ scale: 0.98 }}
            onClick={() => onChange(card.type)}
            className={`relative flex h-full flex-col rounded-2xl border bg-white p-5 text-left shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand-cyan/40 ${
              selected ? 'border-brand-cyan bg-brand-cyanlt/60 shadow-lg' : 'border-brand-cyan/20 hover:border-brand-cyan/60'
            }`}
          >
            <div className={`absolute inset-0 -z-10 rounded-2xl bg-gradient-to-br ${card.accent}`} aria-hidden="true" />
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className={`flex h-12 w-12 items-center justify-center rounded-xl bg-brand-cyan/10 text-brand-navy ${selected ? 'bg-brand-cyan text-brand-deep shadow-lg' : ''}`}>
                  <Icon className="h-6 w-6" />
                </span>
                <div>
                  <p className="font-heading text-lg font-semibold text-brand-navy">{card.title}</p>
                  <p className="text-sm text-brand-deep/70">{card.description}</p>
                </div>
              </div>
              {selected && <CheckCircle2 className="h-6 w-6 text-brand-cyan" aria-hidden="true" />}
            </div>
            <ul className="mt-5 space-y-2 text-sm text-brand-deep/80">
              {card.benefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-brand-cyan" aria-hidden="true" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
            <span className={`mt-5 inline-flex items-center gap-2 text-sm font-semibold ${selected ? 'text-brand-navy' : 'text-brand-cyan'}`}>
              {selected ? 'Seleccionado' : 'Elegir'}
            </span>
          </motion.button>
        )
      })}
    </div>
  )
}
