import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/auth/AuthContext'

/**
 * ProtectedRoute component to guard routes that require authentication
 * Usage: <Route element={<ProtectedRoute><Dashboard /></ProtectedRoute>} path="/dashboard" />
 */
export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full" />
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute
