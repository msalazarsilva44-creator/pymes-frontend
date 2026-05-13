import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { 
  Trash2, 
  ShoppingBag, 
  ArrowRight, 
  Package, 
  Wrench,
  AlertCircle,
  Loader2,
  Plus,
  Minus
} from 'lucide-react'
import Navbar from '../components/Navbar'

export default function Carrito() {
  const { user } = useAuth()
  const { cart, loading, error, fetchCart, removeFromCart, clearEmpresa, itemCount, updateCantidad } = useCart()
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    fetchCart()
  }, [user, navigate, fetchCart])

  const handleRemoveItem = async (itemId: number) => {
    await removeFromCart(itemId)
  }

  const handleCantidad = async (itemId: number, nueva: number) => {
    if (nueva < 1) return
    const res = await updateCantidad(itemId, nueva)
    if (!res.ok && res.message) {
      alert(res.message)
    }
  }

  const handleClearEmpresa = async (empresaId: number) => {
    if (confirm('¿Eliminar todos los items de esta empresa?')) {
      await clearEmpresa(empresaId)
    }
  }

  // Estilos inline
  const styles: Record<string, React.CSSProperties> = {
    page: {
      minHeight: '100vh',
      background: '#f8fafc'
    },
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '32px 24px'
    },
    header: {
      marginBottom: '32px'
    },
    title: {
      fontSize: '1.875rem',
      fontWeight: 700,
      color: '#0f2942',
      marginBottom: '8px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    subtitle: {
      color: '#64748b',
      fontSize: '1rem'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: '1fr 380px',
      gap: '32px'
    },
    mainColumn: {
      display: 'flex',
      flexDirection: 'column',
      gap: '24px'
    },
    empresaCard: {
      background: 'white',
      borderRadius: '16px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
      border: '1px solid #e8edf2',
      overflow: 'hidden'
    },
    empresaHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '20px 24px',
      background: '#f8fafc',
      borderBottom: '1px solid #e2e8f0'
    },
    empresaInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    empresaLogo: {
      width: '40px',
      height: '40px',
      borderRadius: '10px',
      objectFit: 'cover',
      background: '#f1f5f9'
    },
    empresaLogoPlaceholder: {
      width: '40px',
      height: '40px',
      borderRadius: '10px',
      background: 'linear-gradient(135deg, #1e6fa8 0%, #0f2942 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontWeight: 600
    },
    empresaName: {
      fontWeight: 600,
      color: '#0f2942',
      fontSize: '1rem'
    },
    itemsList: {
      padding: '16px 24px'
    },
    item: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '16px',
      padding: '16px 0',
      borderBottom: '1px solid #f1f5f9'
    },
    itemIcon: {
      width: '48px',
      height: '48px',
      borderRadius: '10px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    },
    itemContent: {
      flex: 1
    },
    itemName: {
      fontWeight: 600,
      color: '#0f2942',
      fontSize: '0.95rem',
      marginBottom: '4px'
    },
    itemDesc: {
      color: '#64748b',
      fontSize: '0.85rem',
      marginBottom: '8px',
      lineHeight: 1.4
    },
    itemMeta: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      fontSize: '0.85rem'
    },
    itemCantidad: {
      color: '#64748b'
    },
    itemPrice: {
      fontWeight: 600,
      color: '#0f2942',
      fontSize: '1rem'
    },
    deleteBtn: {
      padding: '8px',
      borderRadius: '8px',
      border: 'none',
      background: '#fef2f2',
      color: '#dc2626',
      cursor: 'pointer',
      transition: 'all 0.2s',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    summaryCard: {
      background: 'white',
      borderRadius: '16px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
      border: '1px solid #e8edf2',
      padding: '24px',
      position: 'sticky',
      top: '24px'
    },
    summaryTitle: {
      fontSize: '1.125rem',
      fontWeight: 700,
      color: '#0f2942',
      marginBottom: '24px'
    },
    summaryRow: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '12px',
      fontSize: '0.95rem'
    },
    summaryLabel: {
      color: '#64748b'
    },
    summaryValue: {
      fontWeight: 500,
      color: '#0f2942'
    },
    summaryTotal: {
      display: 'flex',
      justifyContent: 'space-between',
      paddingTop: '16px',
      borderTop: '2px solid #e2e8f0',
      marginTop: '16px',
      fontSize: '1.125rem',
      fontWeight: 700
    },
    summaryTotalValue: {
      color: '#0f2942'
    },
    checkoutBtn: {
      width: '100%',
      padding: '14px',
      background: '#0f2942',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      fontSize: '1rem',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.2s',
      marginTop: '24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px'
    },
    emptyState: {
      textAlign: 'center',
      padding: '64px 24px',
      background: 'white',
      borderRadius: '16px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)'
    },
    emptyIcon: {
      width: '80px',
      height: '80px',
      borderRadius: '50%',
      background: '#f0f9ff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 24px',
      color: '#1e6fa8'
    },
    emptyTitle: {
      fontSize: '1.25rem',
      fontWeight: 600,
      color: '#0f2942',
      marginBottom: '8px'
    },
    emptyText: {
      color: '#64748b',
      marginBottom: '24px'
    },
    emptyBtn: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      padding: '12px 24px',
      background: '#0f2942',
      color: 'white',
      borderRadius: '10px',
      textDecoration: 'none',
      fontWeight: 500
    },
    errorBanner: {
      background: '#fef2f2',
      border: '1px solid #fecaca',
      borderRadius: '8px',
      padding: '12px 16px',
      marginBottom: '24px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      color: '#dc2626'
    }
  }

  if (loading && !cart) {
    return (
      <div style={styles.page}>
        <Navbar />
        <div style={{ ...styles.container, textAlign: 'center', padding: '64px' }}>
          <Loader2 size={40} style={{ animation: 'spin 1s linear infinite', color: '#1e6fa8' }} />
          <p style={{ marginTop: '16px', color: '#64748b' }}>Cargando carrito...</p>
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    )
  }

  const hasItems = cart && cart.por_empresa && cart.por_empresa.length > 0

  return (
    <div style={styles.page}>
      <Navbar />
      
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>
            <ShoppingBag size={28} />
            Mi Carrito
            {itemCount > 0 && (
              <span style={{ 
                fontSize: '0.875rem', 
                fontWeight: 500, 
                color: '#64748b',
                background: '#f1f5f9',
                padding: '4px 12px',
                borderRadius: '9999px'
              }}>
                {itemCount} {itemCount === 1 ? 'item' : 'items'}
              </span>
            )}
          </h1>
          <p style={styles.subtitle}>Revisa tus servicios y productos antes de confirmar</p>
        </div>

        {error && (
          <div style={styles.errorBanner}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {!hasItems ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>
              <ShoppingBag size={32} />
            </div>
            <h2 style={styles.emptyTitle}>Tu carrito está vacío</h2>
            <p style={styles.emptyText}>Explora el marketplace para encontrar servicios y productos de tu interés</p>
            <a href="/marketplace" style={styles.emptyBtn}>
              Explorar Marketplace
              <ArrowRight size={18} />
            </a>
          </div>
        ) : (
          <div style={{
            ...styles.grid,
            gridTemplateColumns: window.innerWidth < 1024 ? '1fr' : '1fr 380px'
          }}>
            <div style={styles.mainColumn}>
              {cart?.por_empresa.map((empresaGroup) => (
                <div key={empresaGroup.empresa_id} style={styles.empresaCard}>
                  {/* Header de Empresa */}
                  <div style={styles.empresaHeader}>
                    <div style={styles.empresaInfo}>
                      {empresaGroup.empresa.logo ? (
                        <img 
                          src={`http://localhost:8000/storage/${empresaGroup.empresa.logo}`}
                          alt={empresaGroup.empresa.nombre_comercial}
                          style={styles.empresaLogo}
                        />
                      ) : (
                        <div style={styles.empresaLogoPlaceholder}>
                          {empresaGroup.empresa.nombre_comercial.charAt(0)}
                        </div>
                      )}
                      <span style={styles.empresaName}>{empresaGroup.empresa.nombre_comercial}</span>
                    </div>
                    <button
                      onClick={() => handleClearEmpresa(empresaGroup.empresa_id)}
                      style={{
                        padding: '8px',
                        borderRadius: '8px',
                        border: 'none',
                        background: 'transparent',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#fef2f2'
                        e.currentTarget.style.color = '#dc2626'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent'
                        e.currentTarget.style.color = '#94a3b8'
                      }}
                      title="Eliminar items de esta empresa"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  {/* Items */}
                  <div style={styles.itemsList}>
                    {empresaGroup.items.map((item) => (
                      <div key={item.id} style={styles.item}>
                        <div style={{
                          ...styles.itemIcon,
                          background: item.tipo === 'servicio' ? '#f0f9ff' : '#f0fdf4',
                          color: item.tipo === 'servicio' ? '#1e6fa8' : '#16a34a'
                        }}>
                          {item.tipo === 'servicio' ? <Wrench size={24} /> : <Package size={24} />}
                        </div>
                        
                        <div style={styles.itemContent}>
                          <div style={styles.itemName}>{item.nombre}</div>
                          {item.descripcion && (
                            <div style={styles.itemDesc}>{item.descripcion.substring(0, 100)}...</div>
                          )}
                          <div style={styles.itemMeta}>
                            <span style={{
                              padding: '4px 10px',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              textTransform: 'uppercase',
                              background: item.tipo === 'servicio' ? '#f0f9ff' : '#f0fdf4',
                              color: item.tipo === 'servicio' ? '#1e6fa8' : '#16a34a'
                            }}>
                              {item.tipo}
                            </span>
                            {item.tipo === 'producto' ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <button
                                  onClick={() => handleCantidad(item.id, item.cantidad - 1)}
                                  disabled={item.cantidad <= 1}
                                  style={{
                                    width: '28px', height: '28px', borderRadius: '8px',
                                    border: '1px solid #e2e8f0', background: 'white',
                                    cursor: item.cantidad <= 1 ? 'not-allowed' : 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    opacity: item.cantidad <= 1 ? 0.4 : 1
                                  }}
                                  aria-label="Disminuir"
                                >
                                  <Minus size={14} />
                                </button>
                                <span style={{ minWidth: '28px', textAlign: 'center', fontWeight: 600, color: '#0f2942' }}>
                                  {item.cantidad}
                                </span>
                                <button
                                  onClick={() => handleCantidad(item.id, item.cantidad + 1)}
                                  style={{
                                    width: '28px', height: '28px', borderRadius: '8px',
                                    border: '1px solid #e2e8f0', background: 'white',
                                    cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                  }}
                                  aria-label="Aumentar"
                                >
                                  <Plus size={14} />
                                </button>
                              </div>
                            ) : (
                              item.cantidad > 1 && (
                                <span style={styles.itemCantidad}>Cantidad: {item.cantidad}</span>
                              )
                            )}
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <div style={styles.itemPrice}>${parseFloat(String(item.precio || 0)).toFixed(2)}</div>
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            style={styles.deleteBtn}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#fee2e2'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = '#fef2f2'
                            }}
                            title="Eliminar"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Subtotal de empresa */}
                  <div style={{
                    padding: '16px 24px',
                    background: '#f8fafc',
                    borderTop: '1px solid #e2e8f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Subtotal</span>
                    <span style={{ fontWeight: 700, color: '#0f2942', fontSize: '1.1rem' }}>
                      ${parseFloat(String(empresaGroup.subtotal || 0)).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Resumen */}
            <div style={styles.summaryCard}>
              <h3 style={styles.summaryTitle}>Resumen de compra</h3>
              
              <div style={styles.summaryRow}>
                <span style={styles.summaryLabel}>Subtotal</span>
                <span style={styles.summaryValue}>${parseFloat(String(cart?.total || 0)).toFixed(2)}</span>
              </div>
              
              <div style={styles.summaryRow}>
                <span style={styles.summaryLabel}>Envío</span>
                <span style={{ ...styles.summaryValue, color: '#16a34a' }}>Gratis</span>
              </div>

              <div style={styles.summaryTotal}>
                <span>Total</span>
                <span style={styles.summaryTotalValue}>${parseFloat(String(cart?.total || 0)).toFixed(2)}</span>
              </div>

              <button 
                style={styles.checkoutBtn}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#1e6fa8'
                  e.currentTarget.style.transform = 'translateY(-1px)'
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(15,41,66,0.3)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#0f2942'
                  e.currentTarget.style.transform = 'none'
                  e.currentTarget.style.boxShadow = 'none'
                }}
                onClick={() => navigate('/checkout')}
              >
                Proceder al pago
                <ArrowRight size={18} />
              </button>

              <p style={{ 
                textAlign: 'center', 
                fontSize: '0.8rem', 
                color: '#94a3b8',
                marginTop: '16px'
              }}>
                Al continuar, aceptas nuestros términos y condiciones
              </p>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
