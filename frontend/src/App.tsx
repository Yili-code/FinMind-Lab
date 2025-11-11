import { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { StockProvider } from './contexts/StockContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import './App.css'

// 優化：路由懶加載
const EntryPage = lazy(() => import('./pages/EntryPage'))
const Function1Page = lazy(() => import('./pages/Function1Page'))
const Function2Page = lazy(() => import('./pages/Function2Page'))
const FinancialReportsPage = lazy(() => import('./pages/FinancialReportsPage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'))
const TermsPage = lazy(() => import('./pages/TermsPage'))

// 載入中組件
const LoadingFallback = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    minHeight: '50vh',
    color: 'var(--text-primary)'
  }}>
    <div>載入中...</div>
  </div>
)

function App() {
  return (
    <StockProvider>
      <Router>
        <div className="app">
          <Navbar />
          <main className="main-content">
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route path="/" element={<EntryPage />} />
                <Route path="/function1" element={<Function1Page />} />
                <Route path="/function2" element={<Function2Page />} />
                <Route path="/financial-reports" element={<FinancialReportsPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/terms" element={<TermsPage />} />
              </Routes>
            </Suspense>
          </main>
          <Footer />
        </div>
      </Router>
    </StockProvider>
  )
}

export default App
