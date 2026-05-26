import { memo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { MapPin, Star } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000'

export interface ServicioListado {
  id: number
  nombre_comercial: string
  descripcion?: string | null
  categoria?: { nombre?: string | null } | null
  ciudad?: { nombre?: string | null } | null
  municipio?: { nombre?: string | null } | null
  calificacion_promedio?: number | string | null
  servicios?: { id: number; nombre: string }[]
  servicios_count?: number
  logo?: string | null
}

interface ServiceCardProps {
  empresa: ServicioListado
}

function ServiceCard({ empresa }: ServiceCardProps) {
  const prefersReducedMotion = useReducedMotion()
  const rating = typeof empresa.calificacion_promedio === 'number'
    ? empresa.calificacion_promedio.toFixed(1)
    : empresa.calificacion_promedio
  const serviciosCount = empresa.servicios_count ?? empresa.servicios?.length ?? 0

  return (
    <motion.article
      whileHover={prefersReducedMotion ? undefined : { y: -4, boxShadow: '0 18px 40px rgba(14,58,95,0.18)' }}
      transition={{ type: 'spring', stiffness: 320, damping: 26 }}
      className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-transparent bg-white p-6 shadow-[0_12px_32px_rgba(14,58,95,0.08)]"
    >
      <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-brand-navy to-brand-cyan" />

      <div className="flex items-start gap-4">
        <div className="relative">
          {empresa.logo ? (
            <img
              src={`${API_URL}${empresa.logo}`}
              alt={empresa.nombre_comercial}
              className="h-16 w-16 rounded-2xl object-cover shadow-lg"
              loading="lazy"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-navy to-brand-cyan text-xl font-semibold text-white">
              {empresa.nombre_comercial?.charAt(0) ?? 'E'}
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-heading text-xl font-semibold text-brand-navy">
              {empresa.nombre_comercial}
            </h3>
            {rating && (
              <span className="flex items-center gap-1 rounded-full bg-brand-cyanlt px-3 py-1 text-xs font-semibold text-brand-navy">
                <Star className="h-3.5 w-3.5 fill-brand-star text-brand-star" />
                {rating}
              </span>
            )}
          </div>
          <p className="mt-2 text-sm font-medium text-brand-deep/70 line-clamp-2">
            {empresa.descripcion ?? 'Sin descripción disponible'}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm font-semibold text-brand-deep/70">
            {(empresa.ciudad?.nombre || empresa.municipio?.nombre) && (
              <span className="flex items-center gap-1 text-brand-deep/80">
                <MapPin className="h-4 w-4" />
                {[empresa.ciudad?.nombre, empresa.municipio?.nombre].filter(Boolean).join(', ')}
              </span>
            )}
            {empresa.categoria?.nombre && (
              <span className="rounded-full bg-brand-cyanlt px-3 py-1 text-xs font-semibold text-brand-navy">
                {empresa.categoria.nombre}
              </span>
            )}
            {serviciosCount > 0 && (
              <span className="rounded-full bg-white/60 px-3 py-1 text-xs font-semibold text-brand-deep/70">
                {serviciosCount} {serviciosCount === 1 ? 'servicio' : 'servicios'}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {empresa.servicios?.slice(0, 3).map((servicio) => (
          <span key={servicio.id} className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-brand-deep/80">
            {servicio.nombre}
          </span>
        ))}
        {(empresa.servicios?.length ?? 0) > 3 && (
          <span className="rounded-full bg-white/50 px-3 py-1 text-xs font-semibold text-brand-deep/60">
            +{(empresa.servicios?.length ?? 0) - 3} más
          </span>
        )}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <Link
          to={`/empresa/${empresa.id}`}
          className="text-sm font-semibold text-brand-cyan underline-offset-4 transition hover:text-brand-cyan/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        >
          Ver empresa
        </Link>
      </div>
    </motion.article>
  )
}

export default memo(ServiceCard)
