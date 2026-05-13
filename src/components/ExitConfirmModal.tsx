
interface ExitConfirmModalProps {
  onConfirm: () => void
  onCancel: () => void
}

function ExitConfirmModal({ onConfirm, onCancel }: ExitConfirmModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4">
        <h3 className="text-xl font-bold text-gray-900 mb-2">¿Deseas salir del Marketplace?</h3>
        <p className="text-gray-600 mb-6">Si sales perderás los filtros aplicados actualmente.</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl bg-mercarof-navy text-white font-semibold hover:bg-mercarof-navy/90 transition-colors"
          >
            Sí, salir
          </button>
        </div>
      </div>
    </div>
  )
}

export default ExitConfirmModal
