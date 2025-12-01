import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Mock predictions for demo purposes
const mockPredictions = {
  'excellent growth opportunity': { label: 'real', probability: 0.92, suspiciousWords: [] },
  'work from home easy money': { label: 'fake', probability: 0.87, suspiciousWords: ['easy money', 'work from home'] },
  'no experience required high salary': { label: 'fake', probability: 0.95, suspiciousWords: ['no experience required', 'high salary'] },
}

export const predictJobPost = async (text, useRealAPI = false) => {
  try {
    if (!useRealAPI) {
      // Mock API for demo
      return new Promise((resolve) => {
        setTimeout(() => {
          const lowerText = text.toLowerCase()
          let prediction = null

          for (const [key, value] of Object.entries(mockPredictions)) {
            if (lowerText.includes(key)) {
              prediction = value
              break
            }
          }

          if (!prediction) {
            prediction = {
              label: Math.random() > 0.5 ? 'real' : 'fake',
              probability: 0.7 + Math.random() * 0.25,
              suspiciousWords: [],
            }
          }

          resolve({
            success: true,
            data: {
              ...prediction,
              probability: parseFloat(prediction.probability.toFixed(2)),
            },
          })
        }, 2000)
      })
    }

    // Real API call
    const response = await axios.post(`${API_BASE_URL}/predict`, { text })
    return {
      success: true,
      data: response.data,
    }
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to analyze job post. Please try again.',
    }
  }
}

export const predictFromFile = async (file, useRealAPI = false) => {
  try {
    const formData = new FormData()
    formData.append('file', file)

    if (!useRealAPI) {
      // Mock API for demo
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            data: {
              label: Math.random() > 0.5 ? 'real' : 'fake',
              probability: 0.7 + Math.random() * 0.25,
              suspiciousWords: ['easy money', 'work from home'],
            },
          })
        }, 2000)
      })
    }

    const response = await axios.post(`${API_BASE_URL}/predict-file`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return {
      success: true,
      data: response.data,
    }
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to process file. Please try again.',
    }
  }
}
