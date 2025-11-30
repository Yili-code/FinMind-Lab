import './PrivacyPage.css'

function PrivacyPage() {
  return (
    <div className="privacy-page">
      <div className="privacy-container">
        <h1 className="privacy-title">隱私權政策</h1>
        <p className="privacy-updated">最後更新日期：2025年11月9日</p>

        <div className="privacy-content">
          <section className="privacy-section">
            <h2>1. 概述</h2>
            <p>
              Finfo 重視您的隱私權。本政策說明我們如何收集、使用和保護您的個人資料。使用本平台即表示您同意本政策。
            </p>
          </section>

          <section className="privacy-section">
            <h2>2. 資料收集與使用</h2>
            <p>我們可能收集以下資料：</p>
            <ul>
              <li>您主動提供的資訊（如填寫聯絡表單時的姓名、電子郵件）</li>
              <li>自動收集的技術資訊（IP 位址、瀏覽器類型、使用記錄等）</li>
              <li>Cookie 和類似技術收集的使用資料</li>
            </ul>
            <p>我們使用這些資料用於：提供服務、處理您的請求、改善使用者體驗、遵守法律義務。</p>
          </section>

          <section className="privacy-section">
            <h2>3. 資料保護</h2>
            <p>
              我們採用業界標準的安全措施保護您的資料，包括加密技術和安全傳輸協定（HTTPS）。我們不會出售您的個人資料。
            </p>
          </section>

          <section className="privacy-section">
            <h2>4. 您的權利</h2>
            <p>
              您有權要求查看、更正或刪除您的個人資料。如需行使這些權利，請透過 <a href="/contact">聯絡我們</a> 與我們聯繫。
            </p>
          </section>

          <section className="privacy-section">
            <h2>5. Cookie 使用</h2>
            <p>
              我們使用 Cookie 改善使用者體驗和分析網站流量。您可透過瀏覽器設定管理 Cookie。
            </p>
          </section>

          <section className="privacy-section">
            <h2>6. 政策變更</h2>
            <p>
              我們可能不時更新本政策。重大變更將透過網站公告。繼續使用本平台即表示您接受更新後的政策。
            </p>
          </section>

          <section className="privacy-section">
            <h2>7. 聯絡我們</h2>
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

export default PrivacyPage
