import { AlertCircle } from 'lucide-react'
import { cloneElement, isValidElement, ReactElement, ReactNode } from 'react'

type SupportedElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement

export interface FormFieldProps {
  id: string
  label: string
  required?: boolean
  icon?: React.ComponentType<{ className?: string }>
  description?: string
  error?: string
  children: ReactElement<SupportedElement>
  trailing?: ReactNode
}

export function FormField({
  id,
  label,
  required,
  icon: Icon,
  description,
  error,
  children,
  trailing
}: FormFieldProps) {
  if (!isValidElement(children)) {
    throw new Error('FormField requiere un elemento hijo válido')
  }

  const descriptionId = description ? `${id}-description` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [descriptionId, errorId].filter(Boolean).join(' ') || undefined

  const baseInputClass = `w-full rounded-xl border bg-white px-4 py-3 text-sm font-medium text-brand-deep placeholder:text-brand-deep/40 focus:outline-none focus:ring-2 focus:ring-brand-cyan/40`
  const iconPaddingClass = Icon ? 'pl-11' : ''
  const trailingPaddingClass = trailing ? 'pr-12' : ''
  const errorClass = error
    ? 'border-red-300 focus:border-red-400 focus:ring-red-200'
    : 'border-brand-cyan/20 focus:border-brand-cyan'

  const originalClassName = (children.props as { className?: string }).className || ''
  const composedClassName = [baseInputClass, iconPaddingClass, trailingPaddingClass, errorClass, originalClassName]
    .filter(Boolean)
    .join(' ')

  const enhancedChild = cloneElement(children, {
    id,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': describedBy,
    className: composedClassName.trim()
  } as Record<string, unknown>)

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.2em] text-brand-deep/60">
        <span>{label}</span>
        {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-brand-deep/40" />
        )}
        {enhancedChild}
        {trailing && (
          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
            <div className="pointer-events-auto">{trailing}</div>
          </div>
        )}
      </div>
      {description && (
        <p id={descriptionId} className="text-xs text-brand-deep/50">
          {description}
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
