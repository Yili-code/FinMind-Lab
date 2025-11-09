import { Link } from 'react-router-dom'
import './EntryPage.css'

function EntryPage() {
  return (
    <div className="entry-page">
      <div className="entry-content">
        <h1 className="entry-title">FinMind Lab</h1>
        <div className="entry-description">
          <p>
            FinMind Lab 是一個專為金融數據分析與研究打造的實驗平台。
          </p>
          <p>
            提供豐富的金融數據工具與分析功能，協助您深入探索市場趨勢與投資機會。
          </p>
          <p>
            開始使用我們的工具，發掘數據背後的價值與洞察。
          </p>
        </div>

        <div className="entry-features">
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Data Integration</h3>
            <p>股票成交明細與日交易檔整合查詢與視覺化分析</p>
            <Link to="/function1" className="feature-link">
              進入功能 →
            </Link>
          </div>

          <div className="feature-card">
            <div className="feature-icon">💼</div>
            <h3>Response Dashboard</h3>
            <p>股票基本檔管理與財務報表查詢</p>
            <Link to="/function2" className="feature-link">
              進入功能 →
            </Link>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📈</div>
            <h3>財務報表</h3>
            <p>完整的財務數據分析，包含損益表、資產負債表、現金流量表</p>
            <Link to="/financial-reports" className="feature-link">
              查看報表 →
            </Link>
          </div>
        </div>

        <div className="entry-quick-links">
          <h3>快速連結</h3>
          <div className="quick-links-grid">
            <Link to="/function1" className="quick-link">
              <span className="link-icon">📊</span>
              <span>Data Integration</span>
            </Link>
            <Link to="/function2" className="quick-link">
              <span className="link-icon">💼</span>
              <span>Response Dashboard</span>
            </Link>
            <Link to="/financial-reports" className="quick-link">
              <span className="link-icon">📈</span>
              <span>財務報表</span>
            </Link>
            <Link to="/contact" className="quick-link">
              <span className="link-icon">📧</span>
              <span>聯絡我們</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EntryPage
