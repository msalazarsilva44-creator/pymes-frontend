import { cloneElement, isValidElement, ReactElement } from 'react'
import { AlertCircle, Check } from 'lucide-react'

type Control = ReactElement<Record<string, unknown>>

export interface FormFieldProps {
  id: string
  label: string
  required?: boolean
  icon?: React.ComponentType<{ className?: string }>
  hint?: string
  error?: string
  valid?: boolean
  children: Control
}

export function FormField({
  id,
  label,
  required,
  icon: Icon,
  hint,
  error,
  valid,
  children
}: FormFieldProps) {
  if (!isValidElement(children)) {
    throw new Error('FormField requiere un elemento hijo válido')
  }

  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined

  const baseInputClass =
    'w-full rounded-lg border bg-white px-4 py-2.5 text-sm font-medium text-brand-deep placeholder:text-brand-deep/40 focus:outline-none focus:ring-2 focus:ring-brand-cyan/40'
  const iconPaddingClass = Icon ? 'pl-11' : ''
  const stateClass = error
    ? 'border-red-400 focus:border-red-400 focus:ring-red-200'
    : valid
    ? 'border-emerald-400 focus:border-emerald-400 focus:ring-emerald-200'
    : 'border-brand-cyan/20 focus:border-brand-cyan'

  const originalClassName = (children.props.className as string) || ''
  const composedClassName = [baseInputClass, iconPaddingClass, stateClass, originalClassName]
    .filter(Boolean)
    .join(' ')
    .trim()

  const enhancedChild = cloneElement(children, {
    id,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': describedBy,
    className: composedClassName
  } as Record<string, unknown>)

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="flex items-center gap-1 text-sm font-semibold text-brand-deep/80">
        <span>{label}</span>
        {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-brand-deep/40" />
        )}
        {enhancedChild}
        {valid && !error && (
          <Check className="pointer-events-none absolute right-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-emerald-500" aria-hidden="true" />
        )}
      </div>
      {hint && (
        <p id={hintId} className="text-xs text-brand-deep/50">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="flex items-center gap-1 text-xs font-medium text-red-500">
          <AlertCircle className="h-4 w-4" aria-hidden="true" />
          <span>{error}</span>
        </p>
      )}
    </div>
  )
}
