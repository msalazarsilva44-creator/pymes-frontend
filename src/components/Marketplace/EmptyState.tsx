import { memo, type ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { SearchX } from 'lucide-react'

interface EmptyStateProps {
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  icon?: ReactNode
}

function EmptyState({ title, description, actionLabel, onAction, icon }: EmptyStateProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.div
      initial={prefersReducedMotion ? undefined : { opacity: 0, y: 12 }}
      animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-brand-cyan/30 bg-white/90 px-8 py-16 text-center shadow-[0_10px_30px_rgba(14,58,95,0.08)]"
    >
      <div className="rounded-full bg-brand-cyanlt p-4 text-brand-navy">
        {icon ?? <SearchX className="h-10 w-10" aria-hidden="true" />}
      </div>
      <div className="space-y-2">
        <h3 className="font-heading text-xl font-semibold text-brand-navy">{title}</h3>
        {description && <p className="text-sm font-medium text-brand-deep/70">{description}</p>}
      </div>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="rounded-full bg-brand-cyan px-5 py-2 text-sm font-semibold text-brand-deep transition hover:bg-brand-cyan/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        >
          {actionLabel}
        </button>
      )}
    </motion.div>
  )
}

export default memo(EmptyState)
