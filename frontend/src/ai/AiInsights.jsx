import { useState } from 'react'
import { FiCpu, FiMessageSquare, FiAlertTriangle, FiTrendingUp, FiZap } from 'react-icons/fi'
import './AiInsights.css'

function AiInsights({ dataset, analytics }) {
  const [insights, setInsights] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const generateInsights = async () => {
    setLoading(true)
    setError(null)

    try {
      // Build a rich context prompt from real analytics data
      const summary = analytics?.summary || {}
      const health = analytics?.health || {}
      const columns = analytics?.columns || {}
      const correlations = analytics?.correlation_analysis?.strong_correlations || []
      const outliers = analytics?.outlier_analysis?.outlier_summary || {}

      const columnDetails = Object.entries(columns).map(([name, info]) => {
        const details = [`${name} (${info.type})`]
        if (info.mean !== undefined) details.push(`mean=${info.mean?.toFixed(2)}`)
        if (info.min !== undefined) details.push(`min=${info.min}`)
        if (info.max !== undefined) details.push(`max=${info.max}`)
        if (info.missing_percentage > 0) details.push(`${info.missing_percentage?.toFixed(1)}% missing`)
        if (info.unique_count) details.push(`${info.unique_count} unique values`)
        return details.join(', ')
      }).join('\n')

      const correlationText = correlations.length > 0
        ? correlations.map(c => `${c.column1} ↔ ${c.column2}: ${c.correlation?.toFixed(3)}`).join(', ')
        : 'None found'

      const prompt = `You are an expert data analyst. Analyze this dataset and provide specific, actionable insights based on the ACTUAL numbers provided.

DATASET: ${dataset?.filename}
ROWS: ${summary.total_rows} | COLUMNS: ${summary.total_columns}
HEALTH SCORE: ${health.score}% | MISSING VALUES: ${health.missing_percentage}% | DUPLICATES: ${health.duplicates}

COLUMN STATISTICS:
${columnDetails}

STRONG CORRELATIONS: ${correlationText}
OUTLIERS: ${outliers.total_outliers || 0} detected (${outliers.outlier_percentage?.toFixed(1) || 0}%) in ${outliers.affected_columns || 0} columns

Provide a JSON response with this exact structure:
{
  "summary": "2-3 sentence overview mentioning specific numbers from the data",
  "key_findings": [
    {"title": "Finding title", "detail": "Specific insight with actual numbers"},
    {"title": "Finding title", "detail": "Specific insight with actual numbers"},
    {"title": "Finding title", "detail": "Specific insight with actual numbers"}
  ],
  "data_quality": "One sentence about data quality with specific percentages",
  "recommendations": [
    "Specific actionable recommendation based on the actual data",
    "Specific actionable recommendation based on the actual data",
    "Specific actionable recommendation based on the actual data"
  ],
  "watch_out": "One specific warning or concern about this dataset"
}

Only return the JSON, no markdown, no explanation.`

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1000,
          messages: [{ role: 'user', content: prompt }]
        })
      })

      const data = await response.json()
      const text = data.content?.[0]?.text || ''
      const clean = text.replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(clean)
      setInsights(parsed)

    } catch (err) {
      console.error('AI insights error:', err)
      setError('Failed to generate insights. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!analytics) {
    return (
      <div className="ai-insights-empty">
        <FiCpu className="empty-icon" />
        <h3>AI Insights Unavailable</h3>
        <p>Analytics data is required to generate insights.</p>
      </div>
    )
  }

  return (
    <div className="ai-insights">
      <div className="insights-header">
        <div className="header-content">
          <h3>AI-Powered Insights</h3>
          <p>Automated analysis and recommendations for your dataset</p>
        </div>
        <button
          className="explain-btn"
          onClick={generateInsights}
          disabled={loading}
        >
          {loading ? (
            <><FiCpu className="spinning" /> Analyzing...</>
          ) : (
            <><FiZap /> Explain Dataset</>
          )}
        </button>
      </div>

      {error && (
        <div className="insight-card" style={{borderColor: '#ef4444'}}>
          <p style={{color: '#ef4444'}}>{error}</p>
        </div>
      )}

      {insights ? (
        <div className="insights-content">

          <div className="insight-card summary-card">
            <div className="card-header">
              <FiMessageSquare />
              <h4>Dataset Summary</h4>
            </div>
            <p className="summary-text">{insights.summary}</p>
          </div>

          <div className="insight-card">
            <div className="card-header">
              <FiTrendingUp />
              <h4>Key Findings</h4>
            </div>
            <div className="business-insights">
              {insights.key_findings?.map((item, index) => (
                <div key={index} className="business-insight-item">
                  <h5>{item.title}</h5>
                  <p>{item.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="insight-card">
            <div className="card-header">
              <FiAlertTriangle />
              <h4>Data Quality</h4>
            </div>
            <p>{insights.data_quality}</p>
          </div>

          <div className="insight-card">
            <div className="card-header">
              <FiTrendingUp />
              <h4>Recommendations</h4>
            </div>
            <ul className="recommendations-list">
              {insights.recommendations?.map((rec, index) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </div>

          {insights.watch_out && (
            <div className="insight-card" style={{borderLeft: '4px solid #f59e0b'}}>
              <div className="card-header">
                <FiAlertTriangle style={{color: '#f59e0b'}} />
                <h4>Watch Out</h4>
              </div>
              <p>{insights.watch_out}</p>
            </div>
          )}

        </div>
      ) : !loading && (
        <div className="insights-placeholder">
          <FiCpu className="placeholder-icon" />
          <h4>Generate AI Insights</h4>
          <p>Click "Explain Dataset" to generate intelligent insights from your uploaded dataset.</p>
        </div>
      )}
    </div>
  )
}

export default AiInsights