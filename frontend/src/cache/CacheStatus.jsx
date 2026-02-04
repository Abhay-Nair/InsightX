import { useState, useEffect } from 'react'
import { FiDatabase, FiRefreshCw, FiCheck, FiX } from 'react-icons/fi'
import "./CacheStatus.css"

function CacheStatus({ datasetId, onRecompute, loading }) {
  const [cacheInfo, setCacheInfo] = useState({
    status: 'hit', // 'hit', 'miss', 'stale'
    lastUpdated: new Date(),
    hitRate: 85
  })

  useEffect(() => {
    // Simulate cache status check
    const checkCacheStatus = () => {
      const statuses = ['hit', 'miss', 'stale']
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]
      
      setCacheInfo({
        status: randomStatus,
        lastUpdated: new Date(Date.now() - Math.random() * 3600000), // Random time within last hour
        hitRate: Math.floor(Math.random() * 30) + 70 // 70-100%
      })
    }

    checkCacheStatus()
    const interval = setInterval(checkCacheStatus, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [datasetId])

  const getStatusIcon = () => {
    switch (cacheInfo.status) {
      case 'hit':
        return <FiCheck className="status-icon hit" />
      case 'miss':
        return <FiX className="status-icon miss" />
      case 'stale':
        return <FiRefreshCw className="status-icon stale" />
      default:
        return <FiDatabase className="status-icon" />
    }
  }

  const getStatusText = () => {
    switch (cacheInfo.status) {
      case 'hit':
        return 'Cache Hit'
      case 'miss':
        return 'Cache Miss'
      case 'stale':
        return 'Cache Stale'
      default:
        return 'Unknown'
    }
  }

  const getStatusColor = () => {
    switch (cacheInfo.status) {
      case 'hit':
        return '#10b981'
      case 'miss':
        return '#ef4444'
      case 'stale':
        return '#f59e0b'
      default:
        return '#6b7280'
    }
  }

  const formatTime = (date) => {
    const now = new Date()
    const diff = now - date
    const minutes = Math.floor(diff / 60000)
    
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  return (
    <div className="cache-status">
      <div className="cache-indicator">
        {getStatusIcon()}
        <div className="cache-info">
          <div className="cache-status-text" style={{ color: getStatusColor() }}>
            {getStatusText()}
          </div>
          <div className="cache-details">
            <span>Hit Rate: {cacheInfo.hitRate}%</span>
            <span>•</span>
            <span>Updated: {formatTime(cacheInfo.lastUpdated)}</span>
          </div>
        </div>
      </div>

      <div className="cache-actions">
        <button 
          className="cache-action-btn"
          onClick={onRecompute}
          disabled={loading}
          title="Invalidate cache and recompute analytics"
        >
          <FiRefreshCw className={loading ? 'spinning' : ''} />
        </button>
      </div>
    </div>
  )
}

export default CacheStatus