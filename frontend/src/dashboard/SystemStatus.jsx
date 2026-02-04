import { useState, useEffect } from "react"
import { FiServer, FiDatabase, FiCpu, FiActivity } from "react-icons/fi"
import "./SystemStatus.css"

function SystemStatus() {
  const [status, setStatus] = useState({
    cache: { status: 'healthy', hitRate: 85 },
    ai: { status: 'healthy', processing: 2 },
    database: { status: 'healthy', connections: 12 },
    processing: { status: 'healthy', queue: 0 }
  })

  useEffect(() => {
    // Simulate real-time status updates
    const interval = setInterval(() => {
      setStatus(prev => ({
        ...prev,
        cache: {
          ...prev.cache,
          hitRate: Math.max(75, Math.min(95, prev.cache.hitRate + (Math.random() - 0.5) * 5))
        },
        ai: {
          ...prev.ai,
          processing: Math.max(0, Math.min(5, prev.ai.processing + Math.floor((Math.random() - 0.5) * 3)))
        },
        database: {
          ...prev.database,
          connections: Math.max(5, Math.min(20, prev.database.connections + Math.floor((Math.random() - 0.5) * 3)))
        }
      }))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return '#10b981'
      case 'warning': return '#f59e0b'
      case 'error': return '#ef4444'
      default: return '#6b7280'
    }
  }

  const handleClearCache = () => {
    // Simulate cache clearing
    showNotification('Cache cleared successfully', 'success')
    setStatus(prev => ({
      ...prev,
      cache: { ...prev.cache, hitRate: 100 }
    }))
  }

  const handleViewLogs = () => {
    // Simulate opening logs
    showNotification('System logs feature coming soon...', 'info')
    // Future: Open logs modal or navigate to logs page
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
      background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#6366f1'};
    `
    document.body.appendChild(notification)
    
    setTimeout(() => {
      notification.remove()
    }, 3000)
  }

  return (
    <div className="system-status">
      <div className="status-header">
        <h3>System Status</h3>
        <div className="status-indicator healthy">
          <div className="status-dot"></div>
          All Systems Operational
        </div>
      </div>

      <div className="status-items">
        <div className="status-item">
          <div className="status-icon">
            <FiServer />
          </div>
          <div className="status-info">
            <h4>Cache System</h4>
            <p>{Math.round(status.cache.hitRate)}% hit rate</p>
          </div>
          <div 
            className="status-badge"
            style={{ backgroundColor: getStatusColor(status.cache.status) }}
          >
            {status.cache.status}
          </div>
        </div>

        <div className="status-item">
          <div className="status-icon">
            <FiCpu />
          </div>
          <div className="status-info">
            <h4>AI Processing</h4>
            <p>{status.ai.processing} jobs running</p>
          </div>
          <div 
            className="status-badge"
            style={{ backgroundColor: getStatusColor(status.ai.status) }}
          >
            {status.ai.status}
          </div>
        </div>

        <div className="status-item">
          <div className="status-icon">
            <FiDatabase />
          </div>
          <div className="status-info">
            <h4>Database</h4>
            <p>{status.database.connections} connections</p>
          </div>
          <div 
            className="status-badge"
            style={{ backgroundColor: getStatusColor(status.database.status) }}
          >
            {status.database.status}
          </div>
        </div>

        <div className="status-item">
          <div className="status-icon">
            <FiActivity />
          </div>
          <div className="status-info">
            <h4>Processing Queue</h4>
            <p>{status.processing.queue} pending</p>
          </div>
          <div 
            className="status-badge"
            style={{ backgroundColor: getStatusColor(status.processing.status) }}
          >
            {status.processing.status}
          </div>
        </div>
      </div>

      <div className="cache-actions">
        <button className="cache-btn" onClick={handleClearCache}>
          Clear Cache
        </button>
        <button className="cache-btn secondary" onClick={handleViewLogs}>
          View Logs
        </button>
      </div>
    </div>
  )
}

export default SystemStatus