import { useState } from 'react'
import { FiActivity, FiGrid, FiDatabase, FiCpu, FiFileText } from "react-icons/fi"
import ChartSection from "../charts/ChartSection"
import DataPreview from "../data/DataPreview"
import AiInsights from "../ai/AiInsights"
import ReportGenerator from "../reports/ReportGenerator"
import "./DatasetTabs.css"

function DatasetTabs({ dataset, analytics, loading }) {
  const [activeTab, setActiveTab] = useState('overview')

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FiGrid },
    { id: 'charts', label: 'Charts', icon: FiActivity },
    { id: 'data', label: 'Data', icon: FiDatabase },
    { id: 'insights', label: 'AI Insights', icon: FiCpu },
    { id: 'reports', label: 'Reports', icon: FiFileText }
  ]

  const renderTabContent = () => {
    if (loading && activeTab !== 'data' && activeTab !== 'reports') {
      return (
        <div className="tab-loading">
          <div className="loading-spinner">⏳</div>
          <p>Analyzing dataset...</p>
        </div>
      )
    }

    switch (activeTab) {
      case 'overview':
        return <OverviewTab dataset={dataset} analytics={analytics} />
      case 'charts':
        return <ChartSection analytics={analytics} />
      case 'data':
        return <DataPreview dataset={dataset} />
      case 'insights':
        return <AiInsights dataset={dataset} analytics={analytics} />
      case 'reports':
        return <ReportGenerator dataset={dataset} analytics={analytics} />
      default:
        return null
    }
  }

  return (
    <div className="dataset-tabs">
      <div className="tabs-header">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <tab.icon />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="tab-content">
        {renderTabContent()}
      </div>
    </div>
  )
}

function OverviewTab({ dataset, analytics }) {
  if (!analytics) {
    return (
      <div className="overview-empty">
        <p>Analytics data not available</p>
      </div>
    )
  }

  const summary = analytics.summary || {}
  const health = analytics.health || {}
  const cleaning = analytics.cleaning_summary || {}

  return (
    <div className="overview-tab">
      <div className="overview-grid">
        <div className="overview-card">
          <h3>Dataset Summary</h3>
          <div className="summary-stats">
            <div className="stat-item">
              <span className="stat-label">Total Rows</span>
              <span className="stat-value">{summary.total_rows?.toLocaleString() || 0}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total Columns</span>
              <span className="stat-value">{summary.total_columns || 0}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">File Size</span>
              <span className="stat-value">{dataset.file_size || 'Unknown'}</span>
            </div>
          </div>
        </div>

        <div className="overview-card">
          <h3>Data Quality</h3>
          <div className="health-score">
            <div className="score-circle">
              <span className="score-value">{health.score || 0}%</span>
            </div>
            <div className="health-details">
              <div className="health-item">
                <span>Missing Values</span>
                <span>{health.missing_percentage || 0}%</span>
              </div>
              <div className="health-item">
                <span>Duplicate Rows</span>
                <span>{health.duplicates || 0}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="overview-card">
          <h3>Data Cleaning</h3>
          <div className="cleaning-summary">
            <div className="cleaning-item">
              <span>Rows Cleaned</span>
              <span>{cleaning.rows_cleaned || 0}</span>
            </div>
            <div className="cleaning-item">
              <span>Columns Normalized</span>
              <span>{cleaning.columns_normalized || 0}</span>
            </div>
            <div className="cleaning-item">
              <span>Data Types Fixed</span>
              <span>{cleaning.types_converted || 0}</span>
            </div>
          </div>
        </div>

        <div className="overview-card column-types">
          <h3>Column Types</h3>
          <div className="column-type-list">
            {analytics.columns && Object.entries(analytics.columns).map(([column, info]) => (
              <div key={column} className="column-type-item">
                <span className="column-name">{column}</span>
                <span className={`column-type ${info.type}`}>{info.type}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DatasetTabs