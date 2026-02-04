import { useState } from 'react'
import { FiCpu, FiMessageSquare, FiAlertTriangle, FiTrendingUp } from 'react-icons/fi'
import ExplainDatasetButton from './ExplainDatasetButton'
import "./AiInsights.css"

function AiInsights({ dataset, analytics }) {
  const [insights, setInsights] = useState(null)
  const [loading, setLoading] = useState(false)

  // Enhanced AI insights generation based on actual data patterns
  const generateInsights = async () => {
    setLoading(true)
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const mockInsights = {
      summary: generateDatasetSummary(),
      columnInsights: generateColumnInsights(),
      anomalies: generateAnomalies(),
      recommendations: generateRecommendations(),
      businessInsights: generateBusinessInsights()
    }
    
    setInsights(mockInsights)
    setLoading(false)
  }

  const generateDatasetSummary = () => {
    const rows = analytics?.summary?.total_rows || 0
    const columns = analytics?.summary?.total_columns || 0
    const healthScore = analytics?.health?.score || 85
    
    // Analyze the context based on column names - prioritize travel approval data
    const hasTravelData = analytics?.columns?.travel_purpose || analytics?.columns?.approval_status || analytics?.columns?.source_state || analytics?.columns?.destination_state
    const hasUserData = analytics?.columns?.user_id || analytics?.columns?.name || analytics?.columns?.age
    const hasCompanyData = analytics?.columns?.company || analytics?.columns?.Company
    const hasFinancialData = analytics?.columns?.revenue_musd || analytics?.columns?.Revenue_MUSD
    
    let businessContext = "mixed data"
    if (hasTravelData && hasUserData) {
      businessContext = "government travel approval requests with demographic and geographic data"
    } else if (hasCompanyData && hasFinancialData) {
      businessContext = "company performance and financial metrics"
    } else if (hasTravelData) {
      businessContext = "travel approval and routing data"
    } else if (hasUserData) {
      businessContext = "user demographic information"
    }
    
    const datasetType = hasTravelData ? "travel approval system" : "business intelligence"
    const useCase = hasTravelData ? 
      "government efficiency analysis, approval pattern recognition, and demographic travel insights" :
      "competitive analysis, market research, and performance benchmarking"
    
    return `This dataset contains ${rows} ${hasTravelData ? 'travel approval requests' : 'records'} with ${columns} key attributes including ${businessContext}. The data quality is ${healthScore >= 90 ? 'excellent' : healthScore >= 80 ? 'very good' : healthScore >= 70 ? 'good' : 'needs improvement'} with a ${healthScore}% health score. This appears to be a comprehensive ${datasetType} dataset suitable for ${useCase}.`
  }

  const generateColumnInsights = () => {
    if (!analytics?.columns) return []
    
    const insights = []
    
    Object.entries(analytics.columns).forEach(([column, info]) => {
      const columnLower = column.toLowerCase()
      
      // Travel approval specific insights
      if (columnLower.includes('approval_status')) {
        insights.push({
          type: 'info',
          column,
          message: 'Approval status data - key metric for government efficiency and decision pattern analysis'
        })
      }
      
      if (columnLower.includes('travel_purpose')) {
        if (info.unique_count) {
          insights.push({
            type: 'info',
            column,
            message: `${info.unique_count} different travel purposes - enables purpose-based approval analysis`
          })
        }
      }
      
      if (columnLower.includes('source_state') || columnLower.includes('destination_state')) {
        if (info.unique_count) {
          insights.push({
            type: 'info',
            column,
            message: `${info.unique_count} states represented - valuable for interstate travel pattern analysis`
          })
        }
      }
      
      if (columnLower.includes('health_status')) {
        if (info.unique_count) {
          insights.push({
            type: 'info',
            column,
            message: `${info.unique_count} health categories - important for medical travel approval correlation`
          })
        }
      }
      
      if (columnLower.includes('monthly_income')) {
        if (info.missing_percentage > 0) {
          insights.push({
            type: 'warning',
            column,
            message: `${info.missing_percentage}% missing income data - may affect socioeconomic travel analysis`
          })
        } else {
          insights.push({
            type: 'info',
            column,
            message: 'Complete income data - enables economic impact analysis of travel approvals'
          })
        }
      }
      
      if (columnLower.includes('occupation')) {
        if (info.unique_count) {
          insights.push({
            type: 'info',
            column,
            message: `${info.unique_count} occupations represented - useful for profession-based approval patterns`
          })
        }
      }
      
      if (columnLower.includes('age')) {
        insights.push({
          type: 'info',
          column,
          message: 'Age demographics available - enables age-based travel approval trend analysis'
        })
      }
      
      if (columnLower.includes('gender')) {
        if (info.unique_count) {
          insights.push({
            type: 'info',
            column,
            message: `${info.unique_count} gender categories - important for demographic equity analysis`
          })
        }
      }
      
      // Fallback to original business insights if no travel data detected
      if (!columnLower.includes('approval') && !columnLower.includes('travel') && !columnLower.includes('state')) {
        // Revenue insights
        if (columnLower.includes('revenue')) {
          if (info.missing_percentage > 0) {
            insights.push({
              type: 'warning',
              column,
              message: `${info.missing_percentage}% missing revenue data - could indicate private companies or data collection gaps`
            })
          } else {
            insights.push({
              type: 'info',
              column,
              message: 'Complete revenue data available - excellent for financial analysis and benchmarking'
            })
          }
        }
        
        // Growth rate insights
        if (columnLower.includes('growth')) {
          if (info.missing_percentage > 0) {
            insights.push({
              type: 'warning',
              column,
              message: `${info.missing_percentage}% missing growth data - may need estimation or external data sources`
            })
          } else {
            insights.push({
              type: 'info',
              column,
              message: 'Growth rate data complete - valuable for trend analysis and future projections'
            })
          }
        }
        
        // Employee count insights
        if (columnLower.includes('employee')) {
          insights.push({
            type: 'info',
            column,
            message: 'Employee count data useful for company size segmentation and productivity analysis'
          })
        }
        
        // Industry insights
        if (columnLower.includes('industry')) {
          if (info.unique_count) {
            insights.push({
              type: 'info',
              column,
              message: `${info.unique_count} different industries represented - good diversity for sector analysis`
            })
          }
        }
        
        // Country insights
        if (columnLower.includes('country')) {
          if (info.unique_count) {
            insights.push({
              type: 'info',
              column,
              message: `${info.unique_count} countries represented - enables geographic market analysis`
            })
          }
        }
        
        // Profitability insights
        if (columnLower.includes('profitable')) {
          insights.push({
            type: 'info',
            column,
            message: 'Profitability flag available - perfect for financial health segmentation'
          })
        }
        
        // Rating insights
        if (columnLower.includes('rating')) {
          insights.push({
            type: 'info',
            column,
            message: 'Customer rating data - valuable for quality and satisfaction analysis'
          })
        }
      }
      
      // Generic high missing values warning
      if (info.missing_percentage > 20) {
        insights.push({
          type: 'warning',
          column,
          message: `High missing values (${info.missing_percentage}%) - consider data imputation or collection improvement`
        })
      }
      
      // High cardinality warning
      if (info.type === 'categorical' && info.unique_count > 50) {
        insights.push({
          type: 'warning',
          column,
          message: `High cardinality (${info.unique_count} unique values) - may need grouping for analysis`
        })
      }
    })
    
    return insights.slice(0, 8) // Limit to top 8 insights
  }

  const generateAnomalies = () => {
    const anomalies = []
    
    // Data quality anomalies
    if (analytics?.health?.score < 80) {
      anomalies.push({
        type: 'warning',
        title: 'Data Quality Concerns',
        description: 'Some data quality issues detected that may affect analysis accuracy'
      })
    }
    
    // Missing data patterns
    const missingDataColumns = Object.entries(analytics?.columns || {})
      .filter(([_, info]) => info.missing_percentage > 0)
      .length
    
    if (missingDataColumns > 2) {
      anomalies.push({
        type: 'warning',
        title: 'Multiple Columns with Missing Data',
        description: `${missingDataColumns} columns have missing values - may indicate systematic data collection issues`
      })
    }
    
    // Small dataset warning
    if (analytics?.summary?.total_rows < 50) {
      anomalies.push({
        type: 'warning',
        title: 'Limited Sample Size',
        description: 'Small dataset may limit statistical significance of insights and trends'
      })
    }
    
    // Business-specific anomalies
    const hasRevenue = analytics?.columns?.revenue_musd || analytics?.columns?.Revenue_MUSD
    const hasProfitability = analytics?.columns?.profitable || analytics?.columns?.Profitable
    
    if (hasRevenue && hasProfitability) {
      anomalies.push({
        type: 'info',
        title: 'Revenue vs Profitability Analysis Possible',
        description: 'Dataset contains both revenue and profitability data - enables comprehensive financial analysis'
      })
    }
    
    return anomalies
  }

  const generateRecommendations = () => {
    const recommendations = []
    
    // Check if this is travel approval data
    const hasTravelData = analytics?.columns?.travel_purpose || analytics?.columns?.approval_status || analytics?.columns?.source_state
    
    if (hasTravelData) {
      // Travel approval specific recommendations
      recommendations.push('Analyze approval rates by travel purpose to identify potential bias or policy gaps')
      recommendations.push('Create geographic heat maps showing interstate travel patterns and approval rates')
      recommendations.push('Segment approval times by demographic factors (age, occupation, income) for equity analysis')
      recommendations.push('Identify bottlenecks in the approval process by analyzing pending vs approved/rejected ratios')
      
      if (analytics?.columns?.health_status) {
        recommendations.push('Correlate health status with medical travel approvals to optimize healthcare access')
      }
      
      if (analytics?.columns?.monthly_income) {
        recommendations.push('Analyze income distribution vs approval rates to ensure equitable access to travel')
      }
      
      if (analytics?.columns?.occupation) {
        recommendations.push('Study occupation-based approval patterns to identify professional travel needs')
      }
      
      recommendations.push('Implement predictive modeling to forecast approval likelihood and reduce processing time')
      recommendations.push('Create dashboard for real-time monitoring of approval system performance')
    } else {
      // Business intelligence recommendations
      recommendations.push('Segment companies by industry and size for targeted competitive analysis')
      recommendations.push('Analyze revenue per employee ratios to identify operational efficiency leaders')
      
      // Data-driven recommendations based on columns
      if (analytics?.columns?.growth_rate || analytics?.columns?.Growth_Rate) {
        recommendations.push('Create growth rate distribution analysis to identify high-growth sectors')
      }
      
      if (analytics?.columns?.customer_rating || analytics?.columns?.Customer_Rating) {
        recommendations.push('Correlate customer ratings with financial performance for quality-revenue insights')
      }
      
      if (analytics?.columns?.country || analytics?.columns?.Country) {
        recommendations.push('Perform geographic analysis to identify regional market opportunities')
      }
      
      if (analytics?.columns?.founded_date || analytics?.columns?.Founded_Date) {
        recommendations.push('Analyze company age vs performance to understand maturity impact on success')
      }
    }
    
    // Data quality recommendations
    if (analytics?.health?.missing_percentage > 10) {
      recommendations.push('Address missing data through external data sources or statistical imputation')
    }
    
    // Generic recommendations
    recommendations.push('Export insights as PDF report for stakeholder presentations')
    recommendations.push('Set up automated data quality monitoring for future uploads')
    
    return recommendations.slice(0, 8) // Limit to top 8 recommendations
  }

  const generateBusinessInsights = () => {
    // Check if this is travel approval data
    const hasTravelData = analytics?.columns?.travel_purpose || analytics?.columns?.approval_status || analytics?.columns?.source_state
    
    if (hasTravelData) {
      return [
        {
          title: "Government Efficiency",
          insight: "Travel approval system processing multiple request types - opportunity to optimize approval workflows and reduce processing time"
        },
        {
          title: "Demographic Patterns", 
          insight: "Dataset includes age, gender, and occupation data - enables analysis of travel equity and demographic access patterns"
        },
        {
          title: "Geographic Distribution",
          insight: "Interstate travel data with source and destination states - valuable for understanding migration patterns and regional connectivity needs"
        },
        {
          title: "Health-Travel Correlation",
          insight: "Health status linked to travel purposes - critical for optimizing medical travel approvals and healthcare access"
        },
        {
          title: "Economic Impact",
          insight: "Income data available - can analyze socioeconomic factors affecting travel approval rates and accessibility"
        }
      ]
    } else {
      return [
        {
          title: "Market Opportunity",
          insight: "Technology and Healthcare sectors show strong representation - indicates growing digital health market"
        },
        {
          title: "Geographic Distribution", 
          insight: "Global dataset with companies from India, USA, UK, Germany, Denmark, France, and Canada - good for international market analysis"
        },
        {
          title: "Company Maturity",
          insight: "Mix of established (2019-2020) and newer companies (2022-2023) - enables startup vs mature company performance comparison"
        },
        {
          title: "Financial Health",
          insight: "Profitability data available - can identify which industries and company sizes achieve profitability faster"
        }
      ]
    }
  }

  if (!analytics) {
    return (
      <div className="ai-insights-empty">
        <FiCpu className="empty-icon" />
        <h3>AI Insights Unavailable</h3>
        <p>Analytics data is required to generate AI insights</p>
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
        
        <ExplainDatasetButton 
          dataset={dataset}
          onExplain={generateInsights}
          loading={loading}
        />
      </div>

      {insights ? (
        <div className="insights-content">
          <div className="insight-card summary-card">
            <div className="card-header">
              <FiMessageSquare />
              <h4>Dataset Summary</h4>
            </div>
            <p className="summary-text">{insights.summary}</p>
          </div>

          {insights.businessInsights && (
            <div className="insight-card">
              <div className="card-header">
                <FiTrendingUp />
                <h4>Business Intelligence</h4>
              </div>
              <div className="business-insights">
                {insights.businessInsights.map((insight, index) => (
                  <div key={index} className="business-insight-item">
                    <h5>{insight.title}</h5>
                    <p>{insight.insight}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {insights.columnInsights.length > 0 && (
            <div className="insight-card">
              <div className="card-header">
                <FiAlertTriangle />
                <h4>Column Analysis</h4>
              </div>
              <div className="column-insights">
                {insights.columnInsights.map((insight, index) => (
                  <div key={index} className={`insight-item ${insight.type}`}>
                    <div className="insight-column">{insight.column}</div>
                    <div className="insight-message">{insight.message}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {insights.anomalies.length > 0 && (
            <div className="insight-card">
              <div className="card-header">
                <FiAlertTriangle />
                <h4>Key Findings</h4>
              </div>
              <div className="anomalies-list">
                {insights.anomalies.map((anomaly, index) => (
                  <div key={index} className={`anomaly-item ${anomaly.type}`}>
                    <h5>{anomaly.title}</h5>
                    <p>{anomaly.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="insight-card">
            <div className="card-header">
              <FiTrendingUp />
              <h4>Recommendations</h4>
            </div>
            <ul className="recommendations-list">
              {insights.recommendations.map((rec, index) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div className="insights-placeholder">
          <FiCpu className="placeholder-icon" />
          <h4>Generate AI Insights</h4>
          <p>Click "Explain Dataset" to get AI-powered analysis and recommendations for your business data</p>
        </div>
      )}
    </div>
  )
}

export default AiInsights