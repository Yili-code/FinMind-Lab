import { Link } from 'react-router-dom'
import './EntryPage.css'

function EntryPage() {
  return (
    <div className="entry-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Finfo</h1>
          <p className="hero-tagline">用數據說話，讓投資更聰明。</p>
          <div className="hero-cta">
            <Link to="/function1" className="cta-button cta-primary">
              開始分析
            </Link>
            <Link to="/function1" className="cta-button cta-secondary">
              查看功能
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="features-container">
          <h2 className="section-title">核心功能</h2>
          <div className="entry-features">
            <Link to="/function1" className="feature-card">
              <h3>Data Integration</h3>
              <p>整合股票成交明細和日交易檔</p>
            </Link>

            <Link to="/function2" className="feature-card">
              <h3>Stock Management</h3>
              <p>管理你的股票清單，整理、分類基本資訊</p>
            </Link>

            <Link to="/financial-reports" className="feature-card">
              <h3>Financial Reports</h3>
              <p>查看損益表、資產負債表、現金流量表</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="philosophy-section">
        <div className="philosophy-container">
          <div className="entry-philosophy">
            <h2 className="philosophy-title">創作理念</h2>
            <p className="philosophy-quote">
              我們相信「數據不該讓人望而卻步」。
            </p>
            <p>
              Finfo 由三位資工系學生開發，致力於讓股票分析變得更直覺、更高效。
            </p>
            <p>
              我們希望透過簡潔的工具介面，幫助使用者更快掌握市場脈動，
            </p>
            <p>
              把時間留給思考，而不是繁瑣的資料處理。
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default EntryPage
