import { useState } from 'react'
import { FiActivity, FiGrid, FiDatabase, FiCpu, FiFileText, FiTrendingUp, FiTarget } from "react-icons/fi"
import ChartSection from "../charts/ChartSection"
import DataPreview from "../data/DataPreview"
import AiInsights from "../ai/AiInsights"
import ReportGenerator from "../reports/ReportGenerator"
import CorrelationMatrix from "../components/CorrelationMatrix"
import "./DatasetTabs.css"

function DatasetTabs({ dataset, analytics, loading }) {
  const [activeTab, setActiveTab] = useState('overview')

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FiGrid },
    { id: 'charts', label: 'Charts', icon: FiActivity },
    { id: 'correlations', label: 'Correlations', icon: FiTrendingUp },
    { id: 'outliers', label: 'Outliers', icon: FiTarget },
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
      case 'correlations':
        return <CorrelationsTab analytics={analytics} />
      case 'outliers':
        return <OutliersTab analytics={analytics} />
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
            {analytics.columns && Object.entries(analytics.columns).slice(0, 8).map(([column, info]) => (
              <div key={column} className="column-type-item">
                <span className="column-name">{column}</span>
                <span className={`column-type ${info.type}`}>{info.type}</span>
              </div>
            ))}
            {analytics.columns && Object.keys(analytics.columns).length > 8 && (
              <div className="column-type-item more">
                <span className="column-name">... and {Object.keys(analytics.columns).length - 8} more</span>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Insights */}
        {(analytics.correlation_analysis?.strong_correlations?.length > 0 || 
          analytics.outlier_analysis?.outlier_summary?.total_outliers > 0) && (
          <div className="overview-card insights-card">
            <h3>🔍 Key Insights</h3>
            <div className="insights-list">
              {analytics.correlation_analysis?.strong_correlations?.length > 0 && (
                <div className="insight-item success">
                  <span className="insight-icon">🔗</span>
                  <span className="insight-text">
                    Found {analytics.correlation_analysis.strong_correlations.length} strong correlations
                  </span>
                </div>
              )}
              {analytics.outlier_analysis?.outlier_summary?.total_outliers > 0 && (
                <div className="insight-item warning">
                  <span className="insight-icon">🎯</span>
                  <span className="insight-text">
                    Detected {analytics.outlier_analysis.outlier_summary.total_outliers} outliers 
                    ({analytics.outlier_analysis.outlier_summary.outlier_percentage?.toFixed(1)}%)
                  </span>
                </div>
              )}
              {analytics.multicollinearity?.multicollinearity_detected && (
                <div className="insight-item warning">
                  <span className="insight-icon">⚠️</span>
                  <span className="insight-text">
                    Multicollinearity detected in {analytics.multicollinearity.problematic_variables?.length || 0} variables
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DatasetTabs
function CorrelationsTab({ analytics }) {
  // Check if correlation analysis exists and has data
  const hasCorrelationData = analytics?.correlation_analysis?.correlation_matrix && 
    Object.keys(analytics.correlation_analysis.correlation_matrix).length > 0;
  
  const hasAssociationData = analytics?.categorical_associations?.strong_associations && 
    analytics.categorical_associations.strong_associations.length > 0;

  if (!analytics) {
    return (
      <div className="tab-empty">
        <div className="empty-icon">📊</div>
        <h3>Loading Correlation Analysis</h3>
        <p>Please wait while we analyze correlations in your data...</p>
      </div>
    )
  }

  if (!hasCorrelationData && !hasAssociationData) {
    return (
      <div className="tab-empty">
        <div className="empty-icon">📊</div>
        <h3>No Correlations Found</h3>
        <p>This dataset doesn't have enough numeric columns for correlation analysis, or correlations are very weak.</p>
        <div className="empty-suggestions">
          <h4>Possible reasons:</h4>
          <ul>
            <li>Dataset has fewer than 2 numeric columns</li>
            <li>All correlations are very weak (|r| &lt; 0.3)</li>
            <li>Data contains too many missing values</li>
          </ul>
        </div>
      </div>
    )
  }

  return (
    <div className="correlations-tab">
      {hasCorrelationData && (
        <CorrelationMatrix correlationData={analytics.correlation_analysis} />
      )}
      
      {hasAssociationData && (
        <div className="categorical-associations">
          <h3>Categorical Associations</h3>
          <div className="associations-grid">
            {analytics.categorical_associations.strong_associations.map((assoc, index) => (
              <div key={index} className="association-card">
                <div className="association-pair">
                  <span>{assoc.column1}</span>
                  <span>↔</span>
                  <span>{assoc.column2}</span>
                </div>
                <div className="association-strength">
                  Cramér's V: {assoc.cramers_v?.toFixed(3) || 'N/A'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {!hasCorrelationData && hasAssociationData && (
        <div className="info-message">
          <p>📊 Only categorical associations are available for this dataset. Numeric correlations require at least 2 numeric columns.</p>
        </div>
      )}
    </div>
  )
}

function OutliersTab({ analytics }) {
  // Check if outlier analysis exists and has meaningful data
  const hasOutlierData = analytics?.outlier_analysis?.outlier_summary;
  const hasOutliers = hasOutlierData && analytics.outlier_analysis.outlier_summary.total_outliers > 0;

  if (!analytics) {
    return (
      <div className="tab-empty">
        <div className="empty-icon">🎯</div>
        <h3>Loading Outlier Detection</h3>
        <p>Please wait while we detect outliers in your data...</p>
      </div>
    )
  }

  if (!hasOutlierData) {
    return (
      <div className="tab-empty">
        <div className="empty-icon">🎯</div>
        <h3>Outlier Detection Unavailable</h3>
        <p>Outlier detection requires numeric data. This dataset may not have suitable columns for analysis.</p>
      </div>
    )
  }

  const outlierData = analytics.outlier_analysis
  const summary = outlierData.outlier_summary || {}

  if (!hasOutliers) {
    return (
      <div className="tab-empty">
        <div className="empty-icon">✅</div>
        <h3>No Outliers Detected</h3>
        <p>Great news! Your data appears to be clean with no significant outliers detected.</p>
        <div className="clean-data-info">
          <div className="info-item">
            <span className="info-label">Columns Analyzed:</span>
            <span className="info-value">{summary.total_numeric_columns || 0}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Detection Methods:</span>
            <span className="info-value">4 methods used</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="outliers-tab">
      <div className="outlier-summary-section">
        <h3>Outlier Detection Summary</h3>
        <div className="summary-cards">
          <div className="summary-card">
            <div className="card-header">
              <span className="card-icon">🎯</span>
              <span className="card-title">Total Outliers</span>
            </div>
            <div className="card-value">{summary.total_outliers || 0}</div>
          </div>
          
          <div className="summary-card">
            <div className="card-header">
              <span className="card-icon">📊</span>
              <span className="card-title">Affected Columns</span>
            </div>
            <div className="card-value">{summary.affected_columns || 0}</div>
          </div>
          
          <div className="summary-card">
            <div className="card-header">
              <span className="card-icon">📈</span>
              <span className="card-title">Outlier Rate</span>
            </div>
            <div className="card-value">{summary.outlier_percentage?.toFixed(2) || 0}%</div>
          </div>
          
          <div className="summary-card">
            <div className="card-header">
              <span className="card-icon">⚠️</span>
              <span className="card-title">Severity</span>
            </div>
            <div className={`card-value severity-${summary.severity || 'unknown'}`}>
              {summary.severity || 'unknown'}
            </div>
          </div>
        </div>
      </div>

      {outlierData.recommendations && outlierData.recommendations.length > 0 && (
        <div className="recommendations-section">
          <h4>📋 Recommendations</h4>
          <div className="recommendations-list">
            {outlierData.recommendations.map((rec, index) => (
              <div key={index} className="recommendation-item">
                <span className="rec-icon">💡</span>
                <span className="rec-text">{rec}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {outlierData.outliers_by_column && Object.keys(outlierData.outliers_by_column).length > 0 && (
        <div className="outliers-by-column-section">
          <h4>📊 Outliers by Column</h4>
          <div className="columns-grid">
            {Object.entries(outlierData.outliers_by_column).map(([column, data]) => (
              <div key={column} className="column-outlier-card">
                <div className="column-header">
                  <h5>{column}</h5>
                  <span className="outlier-count">
                    {data.summary?.total_outliers || 0} outliers
                  </span>
                </div>
                
                <div className="detection-methods">
                  {Object.entries(data.methods || {}).map(([method, methodData]) => (
                    <div key={method} className="method-badge">
                      <span className="method-name">{methodData.method || method}</span>
                      <span className="method-count">{methodData.outlier_count || 0}</span>
                    </div>
                  ))}
                </div>
                
                {data.summary?.outlier_percentage > 0 && (
                  <div className="outlier-percentage">
                    {data.summary.outlier_percentage.toFixed(1)}% of values
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}