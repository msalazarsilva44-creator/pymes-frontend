import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

type Role = 'admin' | 'empresa' | 'cliente'

interface Props {
  children: React.ReactNode
  role?: Role
}

export default function RequireAuth({ children, role }: Props) {
  const { user, token, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mercarof-cyan" />
      </div>
    )
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />
  }

  if (role && user.role?.name !== role) {
    // Redirigir según el rol real
    if (user.role?.name === 'empresa') return <Navigate to="/dashboard/empresa" replace />
    if (user.role?.name === 'cliente') return <Navigate to="/marketplace" replace />
    if (user.role?.name === 'admin') return <Navigate to="/dashboard/admin" replace />
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
