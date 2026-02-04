import { logout, getUser } from "../utils/auth"
import { useState, useEffect } from "react"
import ThemeToggle from "./ThemeToggle"
import Logo from "./Logo"

function Navbar() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [user, setUser] = useState(null)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    // Get user information from secure storage
    const userData = getUser()
    if (userData) {
      setUser(userData)
    }

    return () => clearInterval(timer)
  }, [])

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout error:', error)
      // Force logout even if server call fails
      window.location.href = "/login"
    }
  }

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="navbar-brand">
          <Logo size="small" showText={true} />
        </div>

        <div className="navbar-center">
          <div className="time-display">
            <div className="time">{formatTime(currentTime)}</div>
            <div className="date">{currentTime.toLocaleDateString()}</div>
          </div>
        </div>

        <div className="navbar-actions">
          <ThemeToggle />
          <div className="user-info">
            <div className="user-avatar">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="user-details">
              <span className="user-name">{user?.name || 'Welcome back!'}</span>
              <span className="user-email">{user?.email || 'User'}</span>
            </div>
          </div>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
