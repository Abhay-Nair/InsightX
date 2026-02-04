import { useState } from "react"
import { register } from "../api/api"
import { Link } from "react-router-dom"
import "./Signup.css"

function Signup() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  })
  const [loading, setLoading] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: []
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })

    // Check password strength in real-time
    if (name === 'password') {
      checkPasswordStrength(value)
    }
  }

  const checkPasswordStrength = (password) => {
    const feedback = []
    let score = 0

    if (password.length >= 12) {
      score += 1
    } else {
      feedback.push('At least 12 characters')
    }

    if (/[A-Z]/.test(password)) {
      score += 1
    } else {
      feedback.push('One uppercase letter')
    }

    if (/[a-z]/.test(password)) {
      score += 1
    } else {
      feedback.push('One lowercase letter')
    }

    if (/\d/.test(password)) {
      score += 1
    } else {
      feedback.push('One number')
    }

    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      score += 1
    } else {
      feedback.push('One special character')
    }

    setPasswordStrength({ score, feedback })
  }

  const getPasswordStrengthColor = () => {
    if (passwordStrength.score <= 2) return '#ef4444'
    if (passwordStrength.score <= 3) return '#f59e0b'
    if (passwordStrength.score <= 4) return '#eab308'
    return '#10b981'
  }

  const getPasswordStrengthText = () => {
    if (passwordStrength.score <= 2) return 'Weak'
    if (passwordStrength.score <= 3) return 'Fair'
    if (passwordStrength.score <= 4) return 'Good'
    return 'Strong'
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    
    if (!formData.name || !formData.email || !formData.password) {
      showNotification('Please fill in all fields', 'error')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      showNotification('Passwords do not match', 'error')
      return
    }

    if (passwordStrength.score < 3) {
      showNotification(`Password too weak. Please include: ${passwordStrength.feedback.join(', ')}`, 'error')
      return
    }

    setLoading(true)
    try {
      const response = await register(formData.name, formData.email, formData.password)
      showNotification('Account created successfully! Please login.', 'success')
      setTimeout(() => {
        window.location.href = "/login"
      }, 1500)
    } catch (err) {
      console.error(err)
      
      // Handle specific error messages from the secure API
      let errorMessage = 'Registration failed. Please try again.'
      
      if (err.message) {
        errorMessage = err.message
      } else if (err.response?.data?.detail) {
        if (typeof err.response.data.detail === 'object' && err.response.data.detail.errors) {
          errorMessage = err.response.data.detail.errors[0]
        } else {
          errorMessage = err.response.data.detail
        }
      }
      
      showNotification(errorMessage, 'error')
    } finally {
      setLoading(false)
    }
  }

  const showNotification = (message, type = 'info') => {
    const notification = document.createElement('div')
    notification.className = `notification ${type}`
    notification.textContent = message
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 16px 24px;
      border-radius: 8px;
      color: white;
      font-weight: 600;
      z-index: 1000;
      animation: slideInRight 0.3s ease;
      background: ${type === 'error' ? '#ef4444' : '#10b981'};
      max-width: 400px;
      word-wrap: break-word;
    `
    document.body.appendChild(notification)
    
    setTimeout(() => {
      notification.remove()
    }, 6000)
  }

  return (
    <div className="signup-container">
      <div className="signup-card">
        <div className="signup-header">
          <h1>Create Account</h1>
          <p>Join InsightX and transform your data into insights</p>
        </div>

        <form onSubmit={handleSignup} className="signup-form">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
              maxLength={100}
              autoComplete="name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
              maxLength={254}
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a strong password"
              required
              maxLength={128}
              autoComplete="new-password"
            />
            {formData.password && (
              <div className="password-strength">
                <div className="strength-bar">
                  <div 
                    className="strength-fill" 
                    style={{
                      width: `${(passwordStrength.score / 5) * 100}%`,
                      backgroundColor: getPasswordStrengthColor()
                    }}
                  ></div>
                </div>
                <div className="strength-text" style={{ color: getPasswordStrengthColor() }}>
                  {getPasswordStrengthText()}
                </div>
                {passwordStrength.feedback.length > 0 && (
                  <div className="strength-feedback">
                    Missing: {passwordStrength.feedback.join(', ')}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              required
              maxLength={128}
              autoComplete="new-password"
            />
          </div>

          <button 
            type="submit" 
            className="signup-button"
            disabled={loading || passwordStrength.score < 3}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="signup-footer">
          <p>
            Already have an account? 
            <Link to="/login" className="login-link">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Signup