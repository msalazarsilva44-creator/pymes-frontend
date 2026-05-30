export type ColorBadge = 'blue' | 'violet' | 'emerald' | 'amber' | 'rose'

export type Plan = {
  id: number
  nombre: string
  slug: string
  descripcion: string | null
  precio_mensual: number
  precio_anual: number
  caracteristicas: string[] | null
  color_badge: ColorBadge
  destacado: boolean
  orden: number
}

export type PaymentFormData = {
  nombre_empresa_pagadora: string
  rif_pagador: string
  referencia_bancaria: string
  fecha_pago: string
}

export type PaymentFieldKey = keyof PaymentFormData
