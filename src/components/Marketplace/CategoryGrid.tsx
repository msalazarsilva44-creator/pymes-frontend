import { memo, type ComponentType } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import {
  Home,
  Sparkles,
  Laptop,
  Wrench,
  ShoppingBag,
  Palette,
  Briefcase,
  HeartPulse,
} from 'lucide-react'

export interface CategoriaItem {
  id: number
  nombre: string
  slug?: string
  empresas_count?: number
  servicios_count?: number
  productos_count?: number
}

interface CategoryGridProps {
  categorias: CategoriaItem[]
  onSelect: (categoriaId: number) => void
  activeId?: number | ''
  onSeeAll?: () => void
}

const iconMap: Record<string, ComponentType<{ className?: string }>> = {
  hogar: Home,
  casa: Home,
  servicios: Wrench,
  tecnologia: Laptop,
  software: Laptop,
  marketing: Sparkles,
  diseño: Palette,
  productos: ShoppingBag,
  negocios: Briefcase,
  salud: HeartPulse,
}

const normalizeKey = (value: string) =>
  value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()

function CategoryCard({
  categoria,
  onSelect,
  isActive,
}: {
  categoria: CategoriaItem
  onSelect: () => void
  isActive: boolean
}) {
  const prefersReducedMotion = useReducedMotion()
  const iconKey = normalizeKey(categoria.slug || categoria.nombre || 'categoria')
  const Icon = iconMap[iconKey] || Sparkles
  const total = categoria.empresas_count ?? categoria.servicios_count ?? categoria.productos_count ?? 0

  return (
    <motion.button
      type="button"
      whileHover={prefersReducedMotion ? undefined : { y: -4 }}
      whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
      onClick={onSelect}
      className={`group flex flex-col items-start gap-4 rounded-2xl border border-transparent bg-white p-5 text-left shadow-[0_8px_24px_rgba(14,58,95,0.08)] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan focus-visible:ring-offset-2 ${
        isActive ? 'border-brand-cyan ring-1 ring-brand-cyan' : ''
      }`}
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-cyanlt text-brand-navy">
        <Icon className="h-6 w-6" aria-hidden="true" />
      </span>
      <div>
        <p className="font-heading text-lg font-semibold text-brand-navy">{categoria.nombre}</p>
        <p className="text-sm font-medium text-brand-deep/70">
          {total > 0 ? `${total} empresas` : 'Explorar' }
        </p>
      </div>
    </motion.button>
  )
}

function CategoryGrid({ categorias, onSelect, activeId, onSeeAll }: CategoryGridProps) {
  const prefersReducedMotion = useReducedMotion()

  if (!categorias || categorias.length === 0) {
    return null
  }

  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-semibold text-brand-navy">Explora por categoría</h2>
          <p className="text-sm font-medium text-brand-deep/70">Descubre negocios destacados por rubro</p>
        </div>
        {onSeeAll && (
          <button
            type="button"
            onClick={onSeeAll}
            className="text-sm font-semibold text-brand-cyan underline-offset-4 transition hover:text-brand-cyan/80"
          >
            Ver todas
          </button>
        )}
      </div>

      <motion.div
        initial={prefersReducedMotion ? undefined : { opacity: 0, y: 24 }}
        whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="grid grid-cols-2 gap-3 md:grid-cols-4"
      >
        {categorias.slice(0, 10).map((categoria) => (
          <CategoryCard
            key={(categoria.id ?? categoria.nombre).toString()}
            categoria={categoria}
            onSelect={() => onSelect(Number(categoria.id))}
            isActive={activeId === Number(categoria.id)}
          />
        ))}
      </motion.div>
    </section>
  )
}

export default memo(CategoryGrid)
