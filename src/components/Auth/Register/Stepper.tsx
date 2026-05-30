import { Check } from 'lucide-react'

export interface StepDefinition {
  id: number
  label: string
}

interface StepperProps {
  steps: StepDefinition[]
  currentStep: number
}

export function Stepper({ steps, currentStep }: StepperProps) {
  const total = steps.length
  const progress = total > 1 ? ((currentStep - 1) / (total - 1)) * 100 : 0

  return (
    <div className="mb-8">
      <div className="relative">
        {/* Línea base */}
        <div className="absolute left-0 right-0 top-4 h-1 rounded-full bg-brand-cyanlt" aria-hidden="true" />
        {/* Línea de progreso */}
        <div
          className="absolute left-0 top-4 h-1 rounded-full bg-brand-cyan transition-all duration-500"
          style={{ width: `${progress}%` }}
          aria-hidden="true"
        />

        <ol className="relative flex items-start justify-between">
          {steps.map((step) => {
            const isCompleted = step.id < currentStep
            const isActive = step.id === currentStep
            return (
              <li key={step.id} className="flex flex-1 flex-col items-center text-center">
                <span
                  className={`z-10 flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors ${
                    isCompleted
                      ? 'border-brand-cyan bg-brand-cyan text-white'
                      : isActive
                      ? 'border-brand-navy bg-brand-navy text-white'
                      : 'border-brand-cyanlt bg-white text-brand-deep/50'
                  }`}
                  aria-current={isActive ? 'step' : undefined}
                >
                  {isCompleted ? <Check className="h-4 w-4" aria-hidden="true" /> : step.id}
                </span>
                <span
                  className={`mt-2 max-w-[8rem] text-xs font-semibold sm:text-sm ${
                    isActive || isCompleted ? 'text-brand-navy' : 'text-brand-deep/50'
                  }`}
                >
                  {step.label}
                </span>
              </li>
            )
          })}
        </ol>
      </div>
    </div>
  )
}
