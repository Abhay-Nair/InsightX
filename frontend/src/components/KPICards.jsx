import { useState, useEffect } from 'react'
const animateValue = (start, end, duration, onUpdate) => {
  let startTime = null

  const step = (timestamp) => {
    if (!startTime) startTime = timestamp
    const progress = Math.min((timestamp - startTime) / duration, 1)
    const value = Math.floor(progress * (end - start) + start)
    onUpdate(value)
    if (progress < 1) requestAnimationFrame(step)
  }

  requestAnimationFrame(step)
}


function KPICards({ analytics }) {
  const [animatedValues, setAnimatedValues] = useState({})
  const summary = analytics.summary || {}
  const statistics = analytics.statistics || {}
  
  // Calculate total missing values
  const totalMissing = Object.values(analytics.columns || {})
    .reduce((sum, col) => sum + (col.missing_count || 0), 0)

  // Get numeric columns count
  const numericColumns = Object.values(analytics.columns || {})
    .filter(col => col.type === 'numeric').length

  // Get categorical columns count  
  const categoricalColumns = Object.values(analytics.columns || {})
    .filter(col => col.type === 'categorical').length

  const kpis = [
    {
      title: 'Total Rows',
      value: summary.total_rows || 0,
      displayValue: summary.total_rows?.toLocaleString() || 'N/A',
      icon: '📊',
      color: 'blue'
    },
    {
      title: 'Total Columns', 
      value: summary.total_columns || 0,
      displayValue: summary.total_columns || 'N/A',
      icon: '📋',
      color: 'green'
    },
    {
      title: 'Missing Values',
      value: totalMissing,
      displayValue: totalMissing.toLocaleString(),
      icon: '⚠️',
      color: totalMissing > 0 ? 'orange' : 'green'
    },
    {
      title: 'Numeric Columns',
      value: numericColumns,
      displayValue: numericColumns,
      icon: '🔢',
      color: 'purple'
    },
    {
      title: 'Categorical Columns',
      value: categoricalColumns,
      displayValue: categoricalColumns,
      icon: '🏷️',
      color: 'teal'
    },
    {
      title: 'Health Score',
      value: analytics.health?.score || 0,
      displayValue: analytics.health?.score ? `${analytics.health.score}%` : 'N/A',
      icon: analytics.health?.score >= 80 ? '💚' : analytics.health?.score >= 60 ? '💛' : '❤️',
      color: analytics.health?.score >= 80 ? 'green' : 
             analytics.health?.score >= 60 ? 'orange' : 'red'
    }
  ]
  useEffect(() => {
      kpis.forEach(kpi => {
        animateValue(0, kpi.value, 800, (val) => {
          setAnimatedValues(prev => ({
            ...prev,
            [kpi.title]: val
          }))
        })
      })
    }, [])


  return (
    <div className="kpi-section">
      <h3>Dataset Overview</h3>
      <div className="kpi-grid">
        {kpis.map((kpi, index) => (
          <div 
            key={index} 
            className={`kpi-card ${kpi.color}`}
          >
            <div className="kpi-icon">{kpi.icon}</div>
            <div className="kpi-content">
              <div className="kpi-value">
                {animatedValues[kpi.title] !== undefined
                  ? animatedValues[kpi.title].toLocaleString()
                  : kpi.displayValue}
              </div>

              <div className="kpi-title">{kpi.title}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default KPICards