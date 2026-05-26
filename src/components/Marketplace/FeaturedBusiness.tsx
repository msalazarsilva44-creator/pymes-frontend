import { memo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Star, Tag, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'

export interface EmpresaDestacada {
  id: number
  nombre_comercial?: string
  descripcion?: string
  categoria?: { nombre?: string | null } | null
  municipio?: { nombre?: string | null } | null
  calificacion_promedio?: number | string | null
  resenas_totales?: number | null
  servicios?: { id: number }[]
}

export interface FeaturedBusinessProps {
  empresa: EmpresaDestacada | null
}

function FeaturedBusiness({ empresa }: FeaturedBusinessProps) {
  const prefersReducedMotion = useReducedMotion()

  if (!empresa) return null

  const rating = typeof empresa.calificacion_promedio === 'number'
    ? empresa.calificacion_promedio.toFixed(1)
    : empresa.calificacion_promedio

  return (
    <motion.section
      initial={prefersReducedMotion ? undefined : { opacity: 0, y: 24 }}
      whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="relative overflow-hidden rounded-3xl bg-brand-navy text-white shadow-[0_30px_60px_rgba(10,46,74,0.45)]"
      aria-labelledby="featured-business-heading"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(31,168,204,0.22),_transparent_55%)]" aria-hidden="true" />
      <div className="relative z-[1] flex flex-col gap-6 px-6 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-10">
        <div className="flex items-start gap-5">
          <div className="flex flex-col items-center gap-3">
            <span className="rounded-2xl bg-brand-cyan p-4 text-brand-deep shadow-[0_12px_30px_rgba(31,168,204,0.45)]">
              <Tag className="h-6 w-6" aria-hidden="true" />
            </span>
            {empresa?.categoria?.nombre && (
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white/80">
                {empresa.categoria.nombre}
              </span>
            )}
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-xs font-semibold text-brand-cyan">
              <span className="rounded-full bg-brand-cyan/10 px-3 py-1 text-brand-cyan">DESTACADO</span>
              {empresa?.municipio?.nombre && (
                <span className="flex items-center gap-1 text-white/75">
                  <MapPin className="h-3.5 w-3.5" />
                  {empresa.municipio.nombre}
                </span>
              )}
            </div>
            <h2 id="featured-business-heading" className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
              {empresa?.nombre_comercial ?? 'Negocio destacado'}
            </h2>
            {empresa?.descripcion && (
              <p className="max-w-xl text-sm font-medium text-white/75">
                {empresa.descripcion}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-4 text-sm font-semibold">
              {rating && (
                <span className="flex items-center gap-1 text-brand-star">
                  <Star className="h-4 w-4 fill-brand-star text-brand-star" />
                  {rating}
                </span>
              )}
              {empresa?.resenas_totales && (
                <span className="text-white/70">{empresa.resenas_totales} reseñas</span>
              )}
              {(empresa?.servicios?.length ?? 0) > 0 && (
                <span className="text-white/70">{empresa.servicios?.length} servicios</span>
              )}
            </div>
          </div>
        </div>

        <Link
          to={`/empresa/${empresa.id}`}
          className="self-start rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-brand-navy shadow-lg transition hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-navy"
        >
          Ver perfil
        </Link>
      </div>
    </motion.section>
  )
}

export default memo(FeaturedBusiness)
