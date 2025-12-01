import { createContext, useContext, useState, useCallback } from 'react'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(false)

  const login = useCallback(async (email, password) => {
    setLoading(true)
    try {
      // TODO: Implement actual login API call
      // const response = await loginAPI(email, password)
      // setUser(response.user)
      // setIsAuthenticated(true)
      // localStorage.setItem('authToken', response.token)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }, [])

  const signup = useCallback(async (email, password, name) => {
    setLoading(true)
    try {
      // TODO: Implement actual signup API call
      // const response = await signupAPI(email, password, name)
      // setUser(response.user)
      // setIsAuthenticated(true)
      // localStorage.setItem('authToken', response.token)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem('authToken')
    // TODO: Call logout API
  }, [])

  const checkAuth = useCallback(() => {
    // TODO: Check if user is authenticated on app load
    const token = localStorage.getItem('authToken')
    if (token) {
      // Verify token and set user
      setIsAuthenticated(true)
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, signup, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
