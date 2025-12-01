import { createContext, useContext, useState, useCallback } from 'react'

const AnalyticsContext = createContext()

export const AnalyticsProvider = ({ children }) => {
  const [predictions, setPredictions] = useState(() => {
    const saved = localStorage.getItem('predictions')
    return saved ? JSON.parse(saved) : []
  })

  const addPrediction = useCallback((prediction) => {
    const newPrediction = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      ...prediction,
    }
    setPredictions((prev) => {
      const updated = [newPrediction, ...prev]
      localStorage.setItem('predictions', JSON.stringify(updated))
      return updated
    })
    return newPrediction
  }, [])

  const clearPredictions = useCallback(() => {
    setPredictions([])
    localStorage.removeItem('predictions')
  }, [])

  const getTotalScanned = () => predictions.length
  const getFakeCount = () => predictions.filter((p) => p.label === 'fake').length
  const getRealCount = () => predictions.filter((p) => p.label === 'real').length

  const getStats = () => ({
    total: getTotalScanned(),
    fake: getFakeCount(),
    real: getRealCount(),
    fakePercentage: getTotalScanned() > 0 ? ((getFakeCount() / getTotalScanned()) * 100).toFixed(1) : 0,
    realPercentage: getTotalScanned() > 0 ? ((getRealCount() / getTotalScanned()) * 100).toFixed(1) : 0,
  })

  return (
    <AnalyticsContext.Provider value={{ predictions, addPrediction, clearPredictions, getStats }}>
      {children}
    </AnalyticsContext.Provider>
  )
}

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext)
  if (!context) {
    throw new Error('useAnalytics must be used within AnalyticsProvider')
  }
  return context
}
