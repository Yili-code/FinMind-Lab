import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { StockProvider } from './contexts/StockContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import EntryPage from './pages/EntryPage'
import Function1Page from './pages/Function1Page'
import Function2Page from './pages/Function2Page'
import FinancialReportsPage from './pages/FinancialReportsPage'
import ContactPage from './pages/ContactPage'
import PrivacyPage from './pages/PrivacyPage'
import TermsPage from './pages/TermsPage'
import './App.css'

function App() {
  return (
    <StockProvider>
      <Router>
        <div className="app">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<EntryPage />} />
              <Route path="/function1" element={<Function1Page />} />
              <Route path="/function2" element={<Function2Page />} />
              <Route path="/financial-reports" element={<FinancialReportsPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </StockProvider>
  )
}

export default App
