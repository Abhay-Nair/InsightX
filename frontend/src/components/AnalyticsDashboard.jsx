import { useState, useEffect } from 'react'
import { getDatasetAnalytics } from '../api/api'
import KPICards from './KPICards'
import ChartSection from '../charts/ChartSection'
import DataTable from './DataTable'
import ExportButton from './ExportButton'
import CorrelationMatrix from './CorrelationMatrix'
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
    <div className="analytics-dashboard glass-page" id="analytics-dashboard">
      <div className="analytics-header">
        <div className="header-left">
          <button onClick={onBack} className="back-button">← Back</button>
          <div className="dataset-title">
            <h2>📊 {dataset.filename}</h2>
            <div className="health-score">
              Health Score: <span className="score">{analytics.health?.score || 'N/A'}</span>
            </div>
          </div>
        </div>
        <div className="header-right">
          <ExportButton analytics={analytics} datasetName={dataset.filename} />
        </div>
      </div>

      <div className="analytics-tabs">
        {["overview", "charts", "correlations", "outliers", "data"].map(tab => (
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
                {analytics.correlation_analysis?.strong_correlations?.length > 0 && (
                  <div className="insight-card success">
                    🔗 {analytics.correlation_analysis.strong_correlations.length} strong correlations found
                  </div>
                )}
                {analytics.outlier_analysis?.outlier_summary?.total_outliers > 0 && (
                  <div className="insight-card warning">
                    🎯 {analytics.outlier_analysis.outlier_summary.total_outliers} outliers detected
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'charts' && (
          <ChartSection analytics={analytics} />
        )}

        {activeTab === 'correlations' && (
          <div className="correlations-tab">
            {analytics.correlation_analysis ? (
              <CorrelationMatrix correlationData={analytics.correlation_analysis} />
            ) : (
              <div className="loading-message">Loading correlation analysis...</div>
            )}
          </div>
        )}

        {activeTab === 'outliers' && (
          <div className="outliers-tab">
            {analytics.outlier_analysis ? (
              <div className="outlier-analysis">
                <div className="outlier-summary">
                  <h3>Outlier Detection Summary</h3>
                  <div className="summary-grid">
                    <div className="summary-card">
                      <span className="summary-label">Total Outliers</span>
                      <span className="summary-value">{analytics.outlier_analysis.outlier_summary?.total_outliers || 0}</span>
                    </div>
                    <div className="summary-card">
                      <span className="summary-label">Affected Columns</span>
                      <span className="summary-value">{analytics.outlier_analysis.outlier_summary?.affected_columns || 0}</span>
                    </div>
                    <div className="summary-card">
                      <span className="summary-label">Outlier Percentage</span>
                      <span className="summary-value">{analytics.outlier_analysis.outlier_summary?.outlier_percentage?.toFixed(2) || 0}%</span>
                    </div>
                    <div className="summary-card">
                      <span className="summary-label">Severity</span>
                      <span className={`summary-value severity-${analytics.outlier_analysis.outlier_summary?.severity}`}>
                        {analytics.outlier_analysis.outlier_summary?.severity || 'unknown'}
                      </span>
                    </div>
                  </div>
                </div>

                {analytics.outlier_analysis.recommendations && (
                  <div className="outlier-recommendations">
                    <h4>Recommendations</h4>
                    <ul>
                      {analytics.outlier_analysis.recommendations.map((rec, index) => (
                        <li key={index}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="outliers-by-column">
                  <h4>Outliers by Column</h4>
                  {Object.entries(analytics.outlier_analysis.outliers_by_column || {}).map(([column, data]) => (
                    <div key={column} className="column-outliers">
                      <h5>{column}</h5>
                      <div className="outlier-methods">
                        {Object.entries(data.methods || {}).map(([method, methodData]) => (
                          <div key={method} className="method-result">
                            <span className="method-name">{methodData.method}</span>
                            <span className="outlier-count">{methodData.outlier_count} outliers</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="loading-message">Loading outlier analysis...</div>
            )}
          </div>
        )}

        {activeTab === 'data' && (
          <DataTable dataset={dataset} />
        )}
      </div>
    </div>
  )
}

export default AnalyticsDashboard