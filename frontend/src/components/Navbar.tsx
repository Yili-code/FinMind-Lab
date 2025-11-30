import { Link } from 'react-router-dom'
import './Navbar.css'

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          Finfo
        </Link>
        <ul className="navbar-menu">
          <li className="navbar-item">
            <Link to="/function1" className="navbar-link">
              Data Integration
            </Link>
          </li>
          <li className="navbar-item">
            <Link to="/function2" className="navbar-link">
              Stock Management
            </Link>
          </li>
          <li className="navbar-item">
            <Link to="/financial-reports" className="navbar-link">
              Financial Reports
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  )
}

export default Navbar

