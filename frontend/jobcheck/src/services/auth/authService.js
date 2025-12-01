import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

/**
 * Login user with email and password
 * TODO: Implement when backend is ready
 */
export const loginUser = async (email, password) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email,
      password,
    })
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
    }
    return {
      success: true,
      data: response.data,
    }
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Login failed',
    }
  }
}

/**
 * Register new user
 * TODO: Implement when backend is ready
 */
export const signupUser = async (email, password, name) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/signup`, {
      email,
      password,
      name,
    })
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
    }
    return {
      success: true,
      data: response.data,
    }
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Signup failed',
    }
  }
}

/**
 * Logout user
 */
export const logoutUser = () => {
  localStorage.removeItem('authToken')
  localStorage.removeItem('user')
}

/**
 * Get current user from localStorage
 */
export const getCurrentUser = () => {
  const user = localStorage.getItem('user')
  return user ? JSON.parse(user) : null
}

/**
 * Check if user is authenticated
 */
export const isUserAuthenticated = () => {
  return !!localStorage.getItem('authToken')
}

/**
 * Verify token with backend
 * TODO: Implement when backend is ready
 */
export const verifyToken = async (token) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/auth/verify`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return { success: true, data: response.data }
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Token verification failed',
    }
  }
}
