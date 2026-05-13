import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react'

export default function Login() {
  const { login, user, token } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (token && user) {
      if (user.role?.name === 'empresa') navigate('/dashboard/empresa', { replace: true })
      else if (user.role?.name === 'cliente') navigate('/marketplace', { replace: true })
    }
  }, [token, user, navigate])
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/auth/login', { email, password })
      const { access_token, user, empresa } = res.data.data
      login(access_token, user, empresa ?? null)
      if (user.role?.name === 'empresa') {
        window.location.href = '/dashboard/empresa'
      } else {
        window.location.href = '/marketplace'
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Email o contraseña incorrectos')
    } finally {
      setLoading(false)
    }
  }

  // Estilos inline para máximo control
  const styles: Record<string, React.CSSProperties> = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
    leftPanel: {
      flex: 1,
      background: 'linear-gradient(145deg, #0f2942 0%, #1e6fa8 60%, #2d8fd4 100%)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'flex-start',
      padding: '60px',
      position: 'relative',
      overflow: 'hidden',
      color: 'white'
    },
    leftPanelBefore: {
      content: '""',
      position: 'absolute',
      width: '400px',
      height: '400px',
      borderRadius: '50%',
      background: 'rgba(255,255,255,0.04)',
      top: '-100px',
      right: '-100px'
    },
    leftPanelAfter: {
      content: '""',
      position: 'absolute',
      width: '250px',
      height: '250px',
      borderRadius: '50%',
      background: 'rgba(255,255,255,0.04)',
      bottom: '-60px',
      left: '-60px'
    },
    logo: {
      fontSize: '2rem',
      fontWeight: 800,
      color: 'white',
      letterSpacing: '-0.5px',
      marginBottom: '24px',
      position: 'relative',
      zIndex: 1
    },
    tagline: {
      fontSize: '1.4rem',
      fontWeight: 600,
      color: 'white',
      lineHeight: 1.4,
      maxWidth: '320px',
      marginBottom: '16px',
      position: 'relative',
      zIndex: 1
    },
    subtitle: {
      color: 'rgba(255,255,255,0.65)',
      fontSize: '0.95rem',
      maxWidth: '300px',
      position: 'relative',
      zIndex: 1
    },
    features: {
      marginTop: '48px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      position: 'relative',
      zIndex: 1
    },
    featureItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      color: 'rgba(255,255,255,0.8)',
      fontSize: '0.9rem'
    },
    featureDot: {
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      background: 'rgba(255,255,255,0.5)',
      flexShrink: 0
    },
    rightPanel: {
      flex: 1,
      background: 'white',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '60px 72px'
    },
    formTitle: {
      fontSize: '1.75rem',
      fontWeight: 700,
      color: '#0f2942',
      marginBottom: '8px'
    },
    formSubtitle: {
      color: '#64748b',
      fontSize: '0.95rem',
      marginBottom: '40px'
    },
    inputGroup: {
      marginBottom: '20px'
    },
    inputLabel: {
      display: 'block',
      fontSize: '0.85rem',
      fontWeight: 600,
      color: '#374151',
      marginBottom: '8px'
    },
    inputField: {
      width: '100%',
      padding: '14px 16px',
      border: '1.5px solid #e2e8f0',
      borderRadius: '10px',
      fontSize: '0.95rem',
      transition: 'all 0.2s ease',
      outline: 'none',
      color: '#0f2942',
      boxSizing: 'border-box'
    },
    passwordWrapper: {
      position: 'relative'
    },
    togglePassword: {
      position: 'absolute',
      right: '14px',
      top: '50%',
      transform: 'translateY(-50%)',
      cursor: 'pointer',
      color: '#94a3b8',
      background: 'none',
      border: 'none',
      padding: '4px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    formOptions: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '28px',
      fontSize: '0.85rem'
    },
    forgotLink: {
      color: '#1e6fa8',
      textDecoration: 'none',
      fontWeight: 500
    },
    btnLogin: {
      width: '100%',
      padding: '14px',
      background: '#0f2942',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      fontSize: '1rem',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      marginBottom: '24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px'
    },
    registerLink: {
      textAlign: 'center',
      fontSize: '0.9rem',
      color: '#64748b'
    },
    registerLinkA: {
      color: '#1e6fa8',
      fontWeight: 600,
      textDecoration: 'none'
    },
    errorBanner: {
      background: '#fef2f2',
      border: '1px solid #fecaca',
      borderRadius: '8px',
      padding: '12px 16px',
      marginBottom: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      color: '#dc2626',
      fontSize: '0.9rem'
    },
    checkboxWrapper: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      cursor: 'pointer'
    },
    checkbox: {
      width: '16px',
      height: '16px',
      accentColor: '#1e6fa8'
    }
  }

  // Media query para móvil (se aplica via JS)
  const isMobile = window.innerWidth < 768

  return (
    <div style={styles.container}>
      {/* Panel izquierdo - decorativo */}
      <div style={{...styles.leftPanel, display: isMobile ? 'none' : 'flex'}}>
        <div style={{ position: 'absolute', ...styles.leftPanelBefore }}></div>
        <div style={{ position: 'absolute', ...styles.leftPanelAfter }}></div>
        
        <Link to="/" style={{...styles.logo, textDecoration: 'none', cursor: 'pointer'}}>MERCAROF</Link>
        <h2 style={styles.tagline}>
          Conectamos empresas con clientes locales
        </h2>
        <p style={styles.subtitle}>
          El marketplace de servicios y productos de tu ciudad
        </p>
        
        <div style={styles.features}>
          <div style={styles.featureItem}>
            <span style={styles.featureDot}></span>
            <span>Más de 500 empresas registradas</span>
          </div>
          <div style={styles.featureItem}>
            <span style={styles.featureDot}></span>
            <span>Servicios y productos locales verificados</span>
          </div>
          <div style={styles.featureItem}>
            <span style={styles.featureDot}></span>
            <span>Compras seguras y confiables</span>
          </div>
        </div>
      </div>

      {/* Panel derecho - formulario */}
      <motion.div 
        style={{
          ...styles.rightPanel,
          flex: isMobile ? 'none' : 1,
          width: isMobile ? '100%' : 'auto',
          padding: isMobile ? '40px 24px' : '60px 72px'
        }}
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Logo en móvil */}
        {isMobile && (
          <Link to="/" style={{ ...styles.logo, color: '#0f2942', marginBottom: '32px', textAlign: 'center', width: '100%', textDecoration: 'none', display: 'block' }}>
            MERCAROF
          </Link>
        )}

        <h1 style={styles.formTitle}>Bienvenido de nuevo</h1>
        <p style={styles.formSubtitle}>Ingresa tus datos para continuar</p>

        <AnimatePresence>
          {error && (
            <motion.div
              style={styles.errorBanner}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <AlertCircle size={18} />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit}>
          <div style={styles.inputGroup}>
            <label style={styles.inputLabel}>Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.inputField}
              placeholder="tu@email.com"
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#1e6fa8'
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(30,111,168,0.1)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0'
                e.currentTarget.style.boxShadow = 'none'
              }}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.inputLabel}>Contraseña</label>
            <div style={styles.passwordWrapper}>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{...styles.inputField, paddingRight: '48px'}}
                placeholder="••••••••"
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#1e6fa8'
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(30,111,168,0.1)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#e2e8f0'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
              <button
                type="button"
                style={styles.togglePassword}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div style={styles.formOptions}>
            <label style={styles.checkboxWrapper}>
              <input type="checkbox" style={styles.checkbox} />
              <span style={{ color: '#64748b' }}>Recordarme</span>
            </label>
            <Link to="/recuperar" style={styles.forgotLink}>
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={styles.btnLogin}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.background = '#1e6fa8'
                e.currentTarget.style.transform = 'translateY(-1px)'
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(15,41,66,0.3)'
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#0f2942'
              e.currentTarget.style.transform = 'none'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            {loading ? (
              <>
                <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                <span>Iniciando sesión...</span>
              </>
            ) : (
              <span>Entrar</span>
            )}
          </button>
        </form>

        <p style={styles.registerLink}>
          ¿No tienes cuenta?{' '}
          <Link to="/registro" style={styles.registerLinkA}>
            Regístrate gratis
          </Link>
        </p>
      </motion.div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
