import './FinancialReportsPage.css'

function FinancialReportsPage() {
  return (
    <div className="financial-reports-page">
      <div className="financial-reports-container">
        <div className="financial-reports-header">
          <h1>財務報表</h1>
          <p className="financial-reports-description">
            提供股票財務報表查詢與分析功能
          </p>
        </div>

        <div className="reports-grid">
          <div className="report-card">
            <h3>Table 4: 資產負債表</h3>
            <div className="report-placeholder">
              <p>資產負債表功能開發中</p>
              <p className="report-note">將顯示公司的資產、負債和股東權益資訊</p>
            </div>
          </div>

          <div className="report-card">
            <h3>Table 5: 損益表</h3>
            <div className="report-placeholder">
              <p>損益表功能開發中</p>
              <p className="report-note">將顯示公司的收入、成本和利潤資訊</p>
            </div>
          </div>

          <div className="report-card">
            <h3>Table 6: 現金流量表</h3>
            <div className="report-placeholder">
              <p>現金流量表功能開發中</p>
              <p className="report-note">將顯示公司的現金流入和流出資訊</p>
            </div>
          </div>
        </div>

        <div className="financial-reports-info">
          <div className="info-card">
            <h4>功能說明</h4>
            <p>財務報表功能將提供完整的財務數據分析，包括：</p>
            <ul>
              <li>資產負債表：顯示公司財務狀況</li>
              <li>損益表：顯示公司經營成果</li>
              <li>現金流量表：顯示公司現金流動情況</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FinancialReportsPage

