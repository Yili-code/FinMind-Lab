import './TermsPage.css'

function TermsPage() {
  return (
    <div className="terms-page">
      <div className="terms-container">
        <h1 className="terms-title">使用條款</h1>
        <p className="terms-updated">最後更新日期：2025年11月9日</p>

        <div className="terms-content">
          <section className="terms-section">
            <h2>1. 接受條款</h2>
            <p>
              使用 InfoHub（以下簡稱「本平台」）即表示您同意遵守本使用條款。如不同意，請勿使用本平台。
            </p>
          </section>

          <section className="terms-section">
            <h2>2. 服務說明</h2>
            <p>
              InfoHub 提供金融數據分析與研究工具。我們保留隨時修改、暫停或終止服務的權利。
            </p>
          </section>

          <section className="terms-section">
            <h2>3. 使用規範</h2>
            <p>使用本平台時，您同意：</p>
            <ul>
              <li>提供真實、準確的資訊</li>
              <li>遵守所有適用的法律和法規</li>
              <li>不進行任何惡意或未經授權的操作</li>
              <li>不使用自動化工具（如爬蟲）存取本平台，除非獲得授權</li>
            </ul>
          </section>

          <section className="terms-section">
            <h2>4. 智慧財產權</h2>
            <p>
              本平台的所有內容均為 InfoHub 或其授權方的財產，受著作權法保護。您提交的內容仍為您所有，但您授予我們使用該內容以提供和改善服務的權利。
            </p>
          </section>

          <section className="terms-section">
            <h2>5. 資料與隱私</h2>
            <p>
              我們對您個人資料的處理方式，詳見我們的 <a href="/privacy">隱私權政策</a>。
            </p>
          </section>

          <section className="terms-section">
            <h2>6. 免責聲明</h2>
            <p>
              本平台以「按現狀」提供，我們不保證服務不間斷、及時或無錯誤。平台提供的資料和分析工具僅供參考，不構成投資建議。任何投資決策應基於您自己的研究和判斷，我們不對任何投資損失負責。
            </p>
          </section>

          <section className="terms-section">
            <h2>7. 責任限制</h2>
            <p>
              在法律允許的最大範圍內，我們不對因使用或無法使用本平台而產生的任何間接、偶然或特殊損害負責。
            </p>
          </section>

          <section className="terms-section">
            <h2>8. 條款修改</h2>
            <p>
              我們保留隨時修改本條款的權利。重大變更將透過網站公告。繼續使用本平台即表示您接受修改後的條款。
            </p>
          </section>

          <section className="terms-section">
            <h2>9. 適用法律</h2>
            <p>
              本條款受中華民國法律管轄。因本條款引起的爭議，應提交至台灣台北地方法院管轄。
            </p>
          </section>

          <section className="terms-section">
            <h2>10. 聯絡我們</h2>
            <p>
              如有任何疑問，請透過以下方式聯絡我們：
            </p>
            <ul>
              <li>電子郵件：<a href="mailto:yili.code@gmail.com">yili.code@gmail.com</a></li>
              <li>聯絡表單：<a href="/contact">聯絡我們</a></li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  )
}

export default TermsPage
