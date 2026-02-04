import { useState, useEffect } from 'react'
import { getDatasetAnalytics } from '../api/api'
import KPICards from './KPICards'
import ChartSection from '../charts/ChartSection'
import DataTable from './DataTable'
import { motion } from "framer-motion"


function AnalyticsDashboard({ dataset, onBack }) {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    loadAnalytics()
  }, [dataset])

  const loadAnalytics = async () => {
    try {
      const data = await getDatasetAnalytics(dataset._id)
      setAnalytics(data)
    } catch (error) {
      console.error('Failed to load analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="analytics-loading">
        <h3>Analyzing {dataset.filename}...</h3>
        <div className="loading-spinner">⏳</div>
        <p>Processing data and generating insights...</p>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="analytics-error">
        <h3>Failed to load analytics</h3>
        <button onClick={onBack}>← Back to Datasets</button>
      </div>
    )
  }

  return (
    <div className="analytics-dashboard glass-page">
      <div className="analytics-header">
        <button onClick={onBack} className="back-button">← Back</button>
        <div className="dataset-title">
          <h2>📊 {dataset.filename}</h2>
          <div className="health-score">
            Health Score: <span className="score">{analytics.health?.score || 'N/A'}</span>
          </div>
        </div>
      </div>

      <div className="analytics-tabs">
        {["overview ", "charts ", "data"].map(tab => (
          <button
            key={tab}
            className={`tab ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.toUpperCase()}
            {activeTab === tab && (
              <motion.div
                layoutId="active-tab"
                className="tab-indicator"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>


      <div className="analytics-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <KPICards analytics={analytics} />
            <div className="insights-section">
              <h3>Key Insights</h3>
              <div className="insights-grid">
                {analytics.health?.issues?.map((issue, index) => (
                  <div key={index} className="insight-card warning">
                    ⚠️ {issue}
                  </div>
                ))}
                <div className="insight-card info">
                  📈 {Object.keys(analytics.statistics || {}).length} numeric columns analyzed
                </div>
                <div className="insight-card info">
                  🏷️ {Object.keys(analytics.categorical || {}).length} categorical columns found
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'charts' && (
          <ChartSection analytics={analytics} />
        )}

        {activeTab === 'data' && (
          <DataTable dataset={dataset} />
        )}
      </div>
    </div>
  )
}

export default AnalyticsDashboard