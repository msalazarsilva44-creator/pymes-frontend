import { useEffect, useRef } from 'react'

interface BackButtonModalProps {
  isOpen: boolean
  onStay: () => void
  onLeave: () => void
}

export default function BackButtonModal({ isOpen, onStay, onLeave }: BackButtonModalProps) {
  const stayBtnRef = useRef<HTMLButtonElement>(null)

  // Focus trap + Escape key
  useEffect(() => {
    if (!isOpen) return
    stayBtnRef.current?.focus()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onStay()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onStay])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onStay}
        style={{ animation: 'bbm-fade-in 200ms ease-out' }}
      />

      {/* Modal */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center"
        role="dialog"
        aria-modal="true"
        aria-labelledby="bbm-title"
        style={{ animation: 'bbm-scale-in 200ms ease-out' }}
      >
        {/* Warning icon */}
        <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-amber-50 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>

        <h3 id="bbm-title" className="text-xl font-bold text-[#0F3D6E] mb-2">
          ¿Deseas salir?
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          Si retrocedes, cerrarás tu sesión activa.
        </p>

        <div className="flex gap-3">
          <button
            ref={stayBtnRef}
            onClick={onStay}
            className="flex-1 py-3.5 rounded-xl font-bold text-sm text-white shadow-md transition-all hover:shadow-lg active:scale-[0.97]"
            style={{ background: 'linear-gradient(135deg, #0F3D6E 0%, #1D6FAD 50%, #00B4D8 100%)' }}
          >
            Permanecer aquí
          </button>
          <button
            onClick={onLeave}
            className="flex-1 py-3.5 rounded-xl font-bold text-sm text-red-500 border-2 border-red-200 hover:bg-red-50 hover:border-red-300 transition-all active:scale-[0.97]"
          >
            Cerrar sesión
          </button>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes bbm-fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes bbm-scale-in {
          from { opacity: 0; transform: scale(0.95); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}
