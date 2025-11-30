import { Link } from 'react-router-dom'
import './Footer.css'

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-links">
          <Link to="/contact" className="footer-link">聯絡我們</Link>
          <span className="footer-separator">|</span>
          <Link to="/privacy" className="footer-link">隱私權政策</Link>
          <span className="footer-separator">|</span>
          <Link to="/terms" className="footer-link">使用條款</Link>
        </div>
        <div className="footer-copyright">
          <p>&copy; 2024 Finfo. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer

