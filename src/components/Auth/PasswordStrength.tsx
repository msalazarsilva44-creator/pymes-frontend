import { motion, AnimatePresence } from 'framer-motion'

interface PasswordStrengthProps {
  password: string
  className?: string
}

type StrengthLevel = 'weak' | 'medium' | 'strong'

function getStrength(password: string): { level: StrengthLevel; score: number } {
  let score = 0
  if (password.length >= 8) score += 1
  if (/[0-9]/.test(password)) score += 1
  if (/[A-Z]/.test(password)) score += 1
  if (/[^A-Za-z0-9]/.test(password)) score += 1
  if (password.length >= 12) score += 1

  if (password.length === 0) {
    return { level: 'weak', score: 0 }
  }

  if (score >= 4) return { level: 'strong', score: 1 }
  if (score >= 2) return { level: 'medium', score: 0.66 }
  return { level: 'weak', score: 0.33 }
}

const COLORS: Record<StrengthLevel, string> = {
  weak: 'bg-red-400',
  medium: 'bg-amber-400',
  strong: 'bg-emerald-500'
}

const LABELS: Record<StrengthLevel, string> = {
  weak: 'Contraseña débil',
  medium: 'Contraseña intermedia',
  strong: 'Contraseña fuerte'
}

export function PasswordStrength({ password, className }: PasswordStrengthProps) {
  const { level, score } = getStrength(password)

  return (
    <div className={className} aria-live="polite">
      <div className="h-2 rounded-full bg-brand-cyanlt">
        <AnimatePresence initial={false}>
          {password && (
            <motion.div
              key={level}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(Math.max(score * 100, 16), 100)}%` }}
              exit={{ width: 0 }}
              transition={{ type: 'spring', stiffness: 120, damping: 20 }}
              className={`h-full rounded-full ${COLORS[level]}`}
            />
          )}
        </AnimatePresence>
      </div>
      <AnimatePresence initial={false}>
        {password && (
          <motion.p
            key={level}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className={`mt-2 text-xs font-semibold uppercase tracking-[0.2em] ${
              level === 'strong'
                ? 'text-emerald-600'
                : level === 'medium'
                ? 'text-amber-600'
                : 'text-red-500'
            }`}
          >
            {LABELS[level]}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
