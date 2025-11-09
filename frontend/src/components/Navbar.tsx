import { Link } from 'react-router-dom'
import './Navbar.css'

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          FinMind Lab
        </Link>
        <ul className="navbar-menu">
          <li className="navbar-item">
            <Link to="/function1" className="navbar-link">
              Function 1
            </Link>
          </li>
          <li className="navbar-item">
            <Link to="/function2" className="navbar-link">
              Function 2
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  )
}

export default Navbar

