import { useState } from 'react'
import { FiDownload, FiFileText, FiLoader } from 'react-icons/fi'
import "./ReportGenerator.css"

function ReportGenerator({ dataset, analytics }) {
  const [generating, setGenerating] = useState(false)
  const [reportOptions, setReportOptions] = useState({
    includeSummary: true,
    includeCharts: true,
    includeDataPreview: true,
    includeAiInsights: false,
    format: 'html'
  })

  const handleGenerateReport = async () => {
    setGenerating(true)
    
    try {
      // Generate HTML report content
      const htmlContent = generateHTMLReport()
      
      if (reportOptions.format === 'html') {
        // Create HTML file
        const blob = new Blob([htmlContent], { type: 'text/html' })
        const url = URL.createObjectURL(blob)
        
        // Download the report
        const link = document.createElement('a')
        link.href = url
        link.download = `${dataset.filename.replace('.csv', '')}_report.html`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        
        showNotification('HTML report generated successfully!', 'success')
      } else {
        // For PDF, open in new window for printing
        const newWindow = window.open('', '_blank')
        newWindow.document.write(htmlContent)
        newWindow.document.close()
        
        // Auto-trigger print dialog
        setTimeout(() => {
          newWindow.print()
        }, 1000)
        
        showNotification('Report opened for printing/saving as PDF', 'success')
      }
    } catch (error) {
      console.error('Failed to generate report:', error)
      showNotification('Failed to generate report', 'error')
    } finally {
      setGenerating(false)
    }
  }

  const generateHTMLReport = () => {
    const summary = analytics?.summary || {}
    const health = analytics?.health || {}
    const columns = analytics?.columns || {}
    const statistics = analytics?.statistics || {}
    
    // Detect data type for contextual reporting
    const hasTravelData = columns.travel_purpose || columns.approval_status || columns.source_state
    const datasetType = hasTravelData ? 'Travel Approval System' : 'Business Intelligence'
    const recordType = hasTravelData ? 'travel requests' : 'records'
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>InsightX Analytics Report - ${dataset.filename}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: #f8f9fa;
        }
        .header {
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            color: white;
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 2.5em;
        }
        .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
        }
        .section {
            background: white;
            padding: 25px;
            margin-bottom: 20px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .section h2 {
            color: #6366f1;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }
        .stat-card {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            border-left: 4px solid #6366f1;
        }
        .stat-value {
            font-size: 2em;
            font-weight: bold;
            color: #6366f1;
        }
        .stat-label {
            color: #666;
            font-size: 0.9em;
            margin-top: 5px;
        }
        .columns-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 15px;
            margin: 20px 0;
        }
        .column-card {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #22d3ee;
        }
        .column-name {
            font-weight: bold;
            color: #333;
            margin-bottom: 5px;
        }
        .column-type {
            display: inline-block;
            background: #6366f1;
            color: white;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 0.8em;
            margin-bottom: 5px;
        }
        .column-stats {
            font-size: 0.9em;
            color: #666;
        }
        .insights-section {
            background: #f0f9ff;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #0ea5e9;
            margin: 20px 0;
        }
        .insights-section h3 {
            color: #0369a1;
            margin-top: 0;
        }
        .insight-item {
            margin: 10px 0;
            padding: 10px;
            background: white;
            border-radius: 6px;
            border-left: 3px solid #22d3ee;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding: 20px;
            color: #666;
            border-top: 1px solid #e5e7eb;
        }
        @media print {
            body { background: white; }
            .section { box-shadow: none; border: 1px solid #ddd; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>📊 InsightX Analytics Report</h1>
        <p><strong>${dataset.filename}</strong> • ${datasetType} Analysis</p>
        <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
    </div>

    ${reportOptions.includeSummary ? `
    <div class="section">
        <h2>📋 Dataset Overview</h2>
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-value">${summary.total_rows?.toLocaleString() || 0}</div>
                <div class="stat-label">${hasTravelData ? 'Travel Requests' : 'Total Records'}</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${summary.total_columns || 0}</div>
                <div class="stat-label">Data Attributes</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${health.score || 0}%</div>
                <div class="stat-label">Data Quality Score</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${(100 - (health.missing_percentage || 0)).toFixed(1)}%</div>
                <div class="stat-label">Data Completeness</div>
            </div>
        </div>
        
        ${hasTravelData ? `
        <div class="insights-section">
            <h3>🎯 System Context</h3>
            <p>This dataset represents a government travel approval system with ${summary.total_rows?.toLocaleString() || 0} requests. 
            The data includes demographic information, travel purposes, geographic routing, and approval outcomes - 
            providing comprehensive insights into government travel patterns and administrative efficiency.</p>
        </div>
        ` : `
        <div class="insights-section">
            <h3>🎯 Business Context</h3>
            <p>This dataset contains ${summary.total_rows?.toLocaleString() || 0} business records with comprehensive 
            performance metrics suitable for competitive analysis, market research, and strategic planning.</p>
        </div>
        `}
    </div>
    ` : ''}

    <div class="section">
        <h2>📊 Data Structure Analysis</h2>
        <div class="columns-grid">
            ${Object.entries(columns).map(([col, info]) => {
              const displayName = col.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim()
              const isKeyField = hasTravelData ? 
                ['approval_status', 'travel_purpose', 'source_state', 'destination_state'].includes(col.toLowerCase()) :
                ['revenue', 'growth', 'industry', 'country'].some(key => col.toLowerCase().includes(key))
              
              return `
                <div class="column-card" ${isKeyField ? 'style="border-left-color: #10b981;"' : ''}>
                    <div class="column-name">${displayName}${isKeyField ? ' ⭐' : ''}</div>
                    <div class="column-type">${info.type || 'unknown'}</div>
                    <div class="column-stats">
                        ${info.missing_percentage > 0 ? `Missing: ${info.missing_percentage}%<br>` : ''}
                        Unique: ${info.unique_count || 0} values
                        ${statistics[col] && typeof statistics[col].mean === 'number' ? `<br>Average: ${statistics[col].mean.toLocaleString()}` : ''}
                    </div>
                </div>
              `
            }).join('')}
        </div>
    </div>

    ${reportOptions.includeDataPreview ? `
    <div class="section">
        <h2>🔍 Data Quality Assessment</h2>
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-value">${health.score || 0}%</div>
                <div class="stat-label">Overall Quality Score</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${health.duplicates || 0}</div>
                <div class="stat-label">Duplicate Records</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${Object.values(columns).filter(col => col.missing_percentage > 0).length}</div>
                <div class="stat-label">Columns with Missing Data</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${Object.values(columns).filter(col => col.type === 'categorical').length}</div>
                <div class="stat-label">Categorical Fields</div>
            </div>
        </div>
        
        <div class="insights-section">
            <h3>📈 Quality Assessment</h3>
            <p><strong>Overall Health:</strong> ${health.score >= 90 ? 'Excellent' : health.score >= 80 ? 'Very Good' : health.score >= 70 ? 'Good' : 'Needs Improvement'} 
            (${health.score || 0}% score)</p>
            
            <p><strong>Data Completeness:</strong> ${100 - (health.missing_percentage || 0)}% of data points are complete</p>
            
            ${health.duplicates > 0 ? `<p><strong>Data Integrity:</strong> ${health.duplicates} duplicate records found - recommend deduplication</p>` : ''}
            
            <div style="margin-top: 15px;">
                <strong>Recommendations:</strong>
                <ul style="margin: 10px 0; padding-left: 20px;">
                    ${health.missing_percentage > 10 ? '<li>Address missing values through data cleaning or imputation strategies</li>' : ''}
                    ${health.duplicates > 0 ? '<li>Remove duplicate records to improve data integrity</li>' : ''}
                    ${hasTravelData ? '<li>Implement data validation rules for travel request submissions</li>' : '<li>Establish data validation rules for future data collection</li>'}
                    <li>Set up regular data quality monitoring and reporting</li>
                    ${hasTravelData ? '<li>Consider adding approval processing time metrics for efficiency analysis</li>' : '<li>Consider adding temporal data for trend analysis</li>'}
                </ul>
            </div>
        </div>
    </div>
    ` : ''}

    ${reportOptions.includeAiInsights ? `
    <div class="section">
        <h2>🤖 AI-Powered Insights</h2>
        
        ${hasTravelData ? `
        <div class="insights-section">
            <h3>🎯 Government Travel Analysis</h3>
            <div class="insight-item">
                <strong>System Efficiency:</strong> This travel approval system processes ${summary.total_rows?.toLocaleString() || 0} requests 
                with comprehensive demographic and geographic tracking, enabling efficiency optimization and policy analysis.
            </div>
            <div class="insight-item">
                <strong>Geographic Patterns:</strong> Interstate travel data reveals movement patterns between states, 
                valuable for understanding regional connectivity and resource allocation needs.
            </div>
            <div class="insight-item">
                <strong>Demographic Equity:</strong> Age, gender, and occupation data enables analysis of travel access equity 
                across different demographic groups and professional categories.
            </div>
            <div class="insight-item">
                <strong>Health-Travel Correlation:</strong> Health status tracking allows for optimization of medical travel approvals 
                and healthcare accessibility analysis.
            </div>
        </div>
        ` : `
        <div class="insights-section">
            <h3>🎯 Business Intelligence</h3>
            <div class="insight-item">
                <strong>Market Analysis:</strong> This dataset contains comprehensive business metrics suitable for competitive analysis, 
                market research, and performance benchmarking across multiple industries.
            </div>
            <div class="insight-item">
                <strong>Financial Performance:</strong> Revenue and growth data enables identification of high-performing companies 
                and industry trends for strategic planning.
            </div>
            <div class="insight-item">
                <strong>Geographic Distribution:</strong> Multi-country representation provides insights into global market dynamics 
                and regional business performance patterns.
            </div>
        </div>
        `}
        
        <div style="margin-top: 20px;">
            <h4>🔍 Key Findings:</h4>
            <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Dataset contains ${summary.total_rows?.toLocaleString() || 0} ${recordType} across ${Object.keys(columns).length} dimensions</li>
                <li>Data quality is ${health.score >= 80 ? 'good' : 'moderate'} with ${health.score}% health score</li>
                ${hasTravelData ? 
                  '<li>Suitable for government efficiency analysis, approval pattern recognition, and demographic travel insights</li>' :
                  '<li>Suitable for competitive analysis, market research, and strategic business planning</li>'
                }
                <li>Recommend additional data sources for comprehensive analysis and trend forecasting</li>
            </ul>
        </div>
    </div>
    ` : ''}

    <div class="footer">
        <p>Generated by <strong>InsightX Analytics Platform</strong> • ${new Date().toLocaleString()}</p>
        <p>Transform your data into powerful insights with AI-powered analytics</p>
        <p style="font-size: 0.9em; margin-top: 10px; color: #888;">
            Report includes ${reportOptions.includeSummary ? '✓' : '✗'} Dataset Summary • 
            ${reportOptions.includeDataPreview ? '✓' : '✗'} Quality Assessment • 
            ${reportOptions.includeAiInsights ? '✓' : '✗'} AI Insights
        </p>
    </div>
</body>
</html>
    `.trim()
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
    `
    document.body.appendChild(notification)
    
    setTimeout(() => {
      notification.remove()
    }, 4000)
  }

  const handleOptionChange = (option, value) => {
    setReportOptions(prev => ({
      ...prev,
      [option]: value
    }))
  }

  if (!dataset || !analytics) {
    return (
      <div className="report-generator-empty">
        <FiFileText className="empty-icon" />
        <h3>Report Generation Unavailable</h3>
        <p>Dataset and analytics data are required to generate reports</p>
      </div>
    )
  }

  return (
    <div className="report-generator">
      <div className="report-header">
        <div className="header-content">
          <h3>Generate Report</h3>
          <p>Create a comprehensive report of your dataset analysis</p>
        </div>
      </div>

      <div className="report-options">
        <h4>Report Options</h4>
        
        <div className="options-grid">
          <label className="option-item">
            <input
              type="checkbox"
              checked={reportOptions.includeSummary}
              onChange={(e) => handleOptionChange('includeSummary', e.target.checked)}
            />
            <span className="option-label">Dataset Summary</span>
            <span className="option-description">Basic statistics and metadata</span>
          </label>

          <label className="option-item">
            <input
              type="checkbox"
              checked={reportOptions.includeDataPreview}
              onChange={(e) => handleOptionChange('includeDataPreview', e.target.checked)}
            />
            <span className="option-label">Data Quality Assessment</span>
            <span className="option-description">Health score and recommendations</span>
          </label>

          <label className="option-item">
            <input
              type="checkbox"
              checked={reportOptions.includeAiInsights}
              onChange={(e) => handleOptionChange('includeAiInsights', e.target.checked)}
            />
            <span className="option-label">AI Insights</span>
            <span className="option-description">Automated analysis and recommendations</span>
          </label>
        </div>

        <div className="format-selection">
          <label>
            <span className="format-label">Format:</span>
            <select
              value={reportOptions.format}
              onChange={(e) => handleOptionChange('format', e.target.value)}
              className="format-select"
            >
              <option value="html">HTML (Recommended)</option>
              <option value="pdf">PDF (Print to PDF)</option>
            </select>
          </label>
        </div>
      </div>

      <div className="report-preview">
        <h4>Report Preview</h4>
        <div className="preview-content">
          <div className="preview-section">
            <h5>📊 {dataset.filename} - Analytics Report</h5>
            <p>Generated on {new Date().toLocaleDateString()}</p>
          </div>
          
          {reportOptions.includeSummary && (
            <div className="preview-section">
              <h6>Dataset Summary</h6>
              <ul>
                <li>{analytics.summary?.total_rows?.toLocaleString() || 0} rows</li>
                <li>{analytics.summary?.total_columns || 0} columns</li>
                <li>{analytics.health?.score || 0}% health score</li>
              </ul>
            </div>
          )}
          
          <div className="preview-section">
            <h6>Column Analysis</h6>
            <p>Detailed breakdown of all {analytics.summary?.total_columns || 0} columns with types and statistics</p>
          </div>
          
          {reportOptions.includeAiInsights && (
            <div className="preview-section">
              <h6>AI Insights</h6>
              <p>Automated analysis, patterns, and business recommendations</p>
            </div>
          )}
        </div>
      </div>

      <div className="report-actions">
        <button
          className="generate-report-btn"
          onClick={handleGenerateReport}
          disabled={generating}
        >
          {generating ? (
            <>
              <FiLoader className="spinning" />
              Generating Report...
            </>
          ) : (
            <>
              <FiDownload />
              Generate Report
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export default ReportGenerator