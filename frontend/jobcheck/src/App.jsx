import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AnalyticsProvider } from './context/AnalyticsContext'
import Navbar from './components/common/Navbar'
import Footer from './components/common/Footer'
import Home from './pages/Home'
import Analyze from './pages/Analyze'

function App() {
  return (
    <AnalyticsProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-white">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/analyze" element={<Analyze />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AnalyticsProvider>
  )
}

export default App
