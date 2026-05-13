import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { X, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react'

export default function CartDrawer() {
  const { cart, drawerOpen, closeDrawer, removeFromCart, updateCantidad } = useCart()
  const navigate = useNavigate()

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [drawerOpen])

  const allItems = cart?.por_empresa?.flatMap(e => e.items) || []
  const subtotal = cart?.total || 0

  const handleUpdateCantidad = async (itemId: number, newCant: number) => {
    if (newCant < 1) return
    await updateCantidad(itemId, newCant)
  }

  const handleRemove = async (itemId: number) => {
    await removeFromCart(itemId)
  }

  const handleIrAlPago = () => {
    closeDrawer()
    navigate('/carrito')
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-[60] transition-opacity duration-300 ${
          drawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeDrawer}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-[#1a1a2e] z-[70] shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
          drawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">Tu Carrito</h2>
          <button
            onClick={closeDrawer}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {allItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag className="w-16 h-16 text-white/20 mb-4" />
              <p className="text-white/50 font-medium">Tu carrito está vacío</p>
              <p className="text-white/30 text-sm mt-1">Agrega productos para verlos aquí</p>
            </div>
          ) : (
            allItems.map(item => (
              <div
                key={item.id}
                className="bg-white/5 border border-white/10 rounded-2xl p-4 flex gap-4"
              >
                {/* Product image placeholder */}
                <div className="w-16 h-16 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                  <ShoppingBag className="w-6 h-6 text-white/30" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{item.nombre}</p>
                      <p className="text-xs text-white/40 mt-0.5">
                        {item.tipo === 'servicio' ? 'Servicio' : 'Producto'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="p-1.5 rounded-lg hover:bg-white/10 transition-colors shrink-0"
                    >
                      <Trash2 className="w-4 h-4 text-white/40 hover:text-red-400" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    {/* Quantity controls */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleUpdateCantidad(item.id, item.cantidad - 1)}
                        disabled={item.cantidad <= 1}
                        className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-white hover:bg-white/20 disabled:opacity-30 transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-sm font-bold text-white">{item.cantidad}</span>
                      <button
                        onClick={() => handleUpdateCantidad(item.id, item.cantidad + 1)}
                        className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Price */}
                    <p className="text-sm font-bold text-[#0E9AA7]">
                      ${(item.precio * item.cantidad).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {allItems.length > 0 && (
          <div className="border-t border-white/10 px-6 py-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/60">Subtotal</span>
              <span className="text-sm font-semibold text-white">
                ${subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/60">Envío</span>
              <span className="text-sm font-semibold text-white/80">Gratis</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <span className="text-base font-bold text-white">Total</span>
              <span className="text-lg font-bold text-[#0E9AA7]">
                ${subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <button
              onClick={handleIrAlPago}
              className="w-full mt-3 py-3.5 rounded-xl bg-[#6c3ce0] hover:bg-[#5a2dc7] text-white font-bold text-sm transition-all"
            >
              Ir al pago
            </button>
          </div>
        )}
      </div>
    </>
  )
}
