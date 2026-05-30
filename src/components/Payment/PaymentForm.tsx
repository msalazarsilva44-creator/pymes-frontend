import { User, FileText, Hash, Calendar, AlertCircle, Check } from 'lucide-react'
import type { PaymentFieldKey, PaymentFormData } from './types'

interface FieldProps {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  value: string
  onChange: (value: string) => void
  onBlur: () => void
  error?: string
  valid?: boolean
  hint?: string
  type?: string
  inputMode?: 'numeric' | 'text'
  placeholder?: string
  maxLength?: number
  max?: string
}

function Field({
  id,
  label,
  icon: Icon,
  value,
  onChange,
  onBlur,
  error,
  valid,
  hint,
  type = 'text',
  inputMode,
  placeholder,
  maxLength,
  max
}: FieldProps) {
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined

  const stateClass = error
    ? 'border-red-400 focus:border-red-400 focus:ring-red-200'
    : valid
    ? 'border-emerald-400 focus:border-emerald-400 focus:ring-emerald-200'
    : 'border-brand-cyan/20 focus:border-brand-cyan'

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="flex items-center gap-1 text-sm font-semibold text-brand-deep/80">
        {label} <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-brand-deep/40" />
        <input
          id={id}
          type={type}
          inputMode={inputMode}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          maxLength={maxLength}
          max={max}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={`w-full rounded-lg border bg-white px-4 py-2.5 pl-11 text-sm font-medium text-brand-deep placeholder:text-brand-deep/40 focus:outline-none focus:ring-2 focus:ring-brand-cyan/40 ${stateClass}`}
        />
        {valid && !error && (
          <Check className="pointer-events-none absolute right-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-emerald-500" aria-hidden="true" />
        )}
      </div>
      {hint && !error && (
        <p id={hintId} className="text-xs text-brand-deep/50">{hint}</p>
      )}
      {error && (
        <p id={errorId} className="flex items-center gap-1 text-xs font-medium text-red-500">
          <AlertCircle className="h-4 w-4" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  )
}

interface PaymentFormProps {
  formData: PaymentFormData
  onChange: (field: PaymentFieldKey, value: string) => void
  onBlur: (field: PaymentFieldKey) => void
  errors: Partial<Record<PaymentFieldKey, string>>
  valids: Partial<Record<PaymentFieldKey, boolean>>
  referenciaLabel: string
  referenciaPlaceholder: string
  maxFecha: string
}

export function PaymentForm({
  formData,
  onChange,
  onBlur,
  errors,
  valids,
  referenciaLabel,
  referenciaPlaceholder,
  maxFecha
}: PaymentFormProps) {
  // El label dinámico ya incluye el asterisco; lo quitamos para el componente Field.
  const refLabel = referenciaLabel.replace(/\s*\*$/, '')

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
      <Field
        id="pay-nombre"
        label="Nombre del Pagador"
        icon={User}
        value={formData.nombre_empresa_pagadora}
        onChange={(v) => onChange('nombre_empresa_pagadora', v)}
        onBlur={() => onBlur('nombre_empresa_pagadora')}
        error={errors.nombre_empresa_pagadora}
        valid={valids.nombre_empresa_pagadora}
        placeholder="Empresa o Persona que realizó el pago"
      />
      <Field
        id="pay-rif"
        label="RIF o Cédula del Pagador"
        icon={FileText}
        value={formData.rif_pagador}
        onChange={(v) => onChange('rif_pagador', v)}
        onBlur={() => onBlur('rif_pagador')}
        error={errors.rif_pagador}
        valid={valids.rif_pagador}
        hint="Entre 7 y 9 dígitos (RIF o cédula)"
        inputMode="numeric"
        placeholder="Entre 7 y 9 dígitos (RIF o cédula)"
        maxLength={9}
      />
      <Field
        id="pay-referencia"
        label={refLabel}
        icon={Hash}
        value={formData.referencia_bancaria}
        onChange={(v) => onChange('referencia_bancaria', v)}
        onBlur={() => onBlur('referencia_bancaria')}
        error={errors.referencia_bancaria}
        valid={valids.referencia_bancaria}
        inputMode="numeric"
        placeholder={referenciaPlaceholder}
        maxLength={6}
      />
      <Field
        id="pay-fecha"
        label="Fecha de Pago"
        icon={Calendar}
        type="date"
        value={formData.fecha_pago}
        onChange={(v) => onChange('fecha_pago', v)}
        onBlur={() => onBlur('fecha_pago')}
        error={errors.fecha_pago}
        valid={valids.fecha_pago}
        max={maxFecha}
      />
    </div>
  )
}
