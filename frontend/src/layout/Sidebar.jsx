import { NavLink, useNavigate } from "react-router-dom"
import { FiGrid, FiDatabase, FiLogOut, FiActivity } from "react-icons/fi"
import { logout } from "../utils/auth"
import Logo from "../components/Logo"
import "./Sidebar.css"

function Sidebar() {
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout error:', error)
      // Force logout even if server call fails
      navigate("/login")
    }
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <Logo size="medium" showText={true} />
      </div>

      <nav className="sidebar-nav">
        <NavLink 
          to="/dashboard" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <FiGrid />
          Dashboard
        </NavLink>

        <NavLink 
          to="/datasets" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <FiDatabase />
          Datasets
        </NavLink>

        <NavLink 
          to="/analytics" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <FiActivity />
          Analytics
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout}>
          <FiLogOut />
          Logout
        </button>
      </div>
    </aside>
  )
}

export default Sidebar