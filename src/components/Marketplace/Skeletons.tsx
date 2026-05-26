import { memo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

export const CategorySkeleton = memo(function CategorySkeleton() {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.div
      initial={prefersReducedMotion ? undefined : { opacity: 0, y: 12 }}
      animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      className="animate-pulse rounded-2xl bg-white p-5 shadow-[0_8px_24px_rgba(14,58,95,0.08)]"
    >
      <div className="mb-4 h-12 w-12 rounded-2xl bg-brand-cyanlt" />
      <div className="h-4 w-32 rounded bg-brand-cyanlt/80" />
      <div className="mt-2 h-3 w-20 rounded bg-brand-cyanlt/60" />
    </motion.div>
  )
})

export const CardSkeleton = memo(function CardSkeleton() {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.div
      initial={prefersReducedMotion ? undefined : { opacity: 0, y: 12 }}
      animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      className="flex h-full flex-col gap-4 rounded-3xl bg-white p-6 shadow-[0_12px_32px_rgba(14,58,95,0.08)]"
    >
      <div className="flex items-start gap-4">
        <div className="h-16 w-16 rounded-2xl bg-brand-cyanlt" />
        <div className="flex-1 space-y-3">
          <div className="h-4 w-2/3 rounded bg-brand-cyanlt/80" />
          <div className="h-3 w-full rounded bg-brand-cyanlt/60" />
          <div className="h-3 w-5/6 rounded bg-brand-cyanlt/60" />
        </div>
      </div>
      <div className="h-3 w-3/4 rounded bg-brand-cyanlt/60" />
      <div className="mt-auto flex gap-2">
        <div className="h-6 w-20 rounded-full bg-brand-cyanlt/70" />
        <div className="h-6 w-24 rounded-full bg-brand-cyanlt/70" />
      </div>
    </motion.div>
  )
})
