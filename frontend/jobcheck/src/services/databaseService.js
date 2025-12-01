import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

/**
 * Save user's analysis to database (requires authentication)
 * TODO: Implement when backend and auth are ready
 */
export const saveAnalysis = async (analysisData) => {
  try {
    const token = localStorage.getItem('authToken')
    const response = await axios.post(`${API_BASE_URL}/analyses/save`, analysisData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return {
      success: true,
      data: response.data,
    }
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to save analysis',
    }
  }
}

/**
 * Get user's analysis history
 * TODO: Implement when backend and auth are ready
 */
export const getUserAnalyses = async (filters = {}) => {
  try {
    const token = localStorage.getItem('authToken')
    const response = await axios.get(`${API_BASE_URL}/analyses/user`, {
      params: filters,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return {
      success: true,
      data: response.data,
    }
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch analyses',
    }
  }
}

/**
 * Get single analysis details
 * TODO: Implement when backend and auth are ready
 */
export const getAnalysisDetail = async (analysisId) => {
  try {
    const token = localStorage.getItem('authToken')
    const response = await axios.get(`${API_BASE_URL}/analyses/${analysisId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return {
      success: true,
      data: response.data,
    }
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch analysis',
    }
  }
}

/**
 * Delete user's analysis
 * TODO: Implement when backend and auth are ready
 */
export const deleteAnalysis = async (analysisId) => {
  try {
    const token = localStorage.getItem('authToken')
    const response = await axios.delete(`${API_BASE_URL}/analyses/${analysisId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return {
      success: true,
      data: response.data,
    }
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to delete analysis',
    }
  }
}

/**
 * Get user's analytics statistics
 * TODO: Implement when backend and auth are ready
 */
export const getUserStats = async () => {
  try {
    const token = localStorage.getItem('authToken')
    const response = await axios.get(`${API_BASE_URL}/analyses/stats`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return {
      success: true,
      data: response.data,
    }
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch stats',
    }
  }
}
