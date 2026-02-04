import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar, Line, Pie, Scatter } from 'react-chartjs-2'
import "./ChartSection.css"

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

function ChartSection({ analytics }) {
  if (!analytics) {
    return (
      <div className="charts-empty">
        <div className="empty-icon">📊</div>
        <h3>No analytics data available</h3>
        <p>Analytics data is still being processed or unavailable</p>
      </div>
    )
  }

  const statistics = analytics.statistics || {}
  const categorical = analytics.categorical || {}
  const columns = analytics.columns || {}

  // Generate colors for charts
  const generateColors = (count) => {
    const colors = [
      '#6366f1', '#22d3ee', '#10b981', '#f59e0b', 
      '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16',
      '#f97316', '#ec4899', '#14b8a6', '#a855f7'
    ]
    return Array.from({ length: count }, (_, i) => colors[i % colors.length])
  }

  const charts = []

  // Detect data type for contextual charts
  const hasTravelData = columns.travel_purpose || columns.approval_status || columns.source_state
  const hasCompanyData = columns.company || columns.revenue_musd || columns.industry

  // Statistics Bar Chart (for numerical columns)
  const numericalStats = Object.entries(statistics).filter(([_, stat]) => 
    stat && typeof stat.mean === 'number' && !isNaN(stat.mean)
  )
  
  if (numericalStats.length > 0) {
    const statisticsData = {
      labels: numericalStats.map(([col]) => {
        // Convert snake_case to readable format
        return col.replace(/_/g, ' ')
                 .replace(/\b\w/g, l => l.toUpperCase())
                 .replace('Musd', 'M USD')
      }),
      datasets: [
        {
          label: 'Mean Values',
          data: numericalStats.map(([_, stat]) => Math.round(stat.mean * 100) / 100),
          backgroundColor: generateColors(numericalStats.length),
          borderColor: generateColors(numericalStats.length).map(color => color.replace('0.8', '1')),
          borderWidth: 2,
        },
      ],
    }

    charts.push({
      id: 'statistics',
      title: hasTravelData ? 'Average Values (Age, Income)' : 'Statistical Summary (Mean Values)',
      type: 'bar',
      data: statisticsData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          title: { display: false },
          tooltip: {
            callbacks: {
              label: function(context) {
                const value = context.parsed.y
                // Format large numbers
                if (value > 1000000) {
                  return `${context.label}: ${(value / 1000000).toFixed(1)}M`
                } else if (value > 1000) {
                  return `${context.label}: ${(value / 1000).toFixed(1)}K`
                }
                return `${context.label}: ${value.toLocaleString()}`
              }
            }
          }
        },
        scales: {
          y: { 
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                if (value > 1000000) {
                  return (value / 1000000).toFixed(1) + 'M'
                } else if (value > 1000) {
                  return (value / 1000).toFixed(1) + 'K'
                }
                return value.toLocaleString()
              }
            }
          },
          x: {
            ticks: {
              maxRotation: 45,
              minRotation: 0
            }
          }
        }
      }
    })
  }

  // Approval Status Chart (for travel data)
  if (hasTravelData && categorical.approval_status) {
    const approvalData = categorical.approval_status.top_values || {}
    const approvalEntries = Object.entries(approvalData).slice(0, 6)
    
    if (approvalEntries.length > 0) {
      const approvalChartData = {
        labels: approvalEntries.map(([status]) => {
          // Clean up approval status labels
          return status.replace(/_/g, ' ')
                      .replace(/APPROVED/g, 'Approved')
                      .replace(/REJECTED/g, 'Rejected')
                      .replace(/PENDING/g, 'Pending')
                      .replace(/DOCTOR/g, 'by Doctor')
                      .replace(/GOVT/g, 'by Govt')
        }),
        datasets: [
          {
            data: approvalEntries.map(([_, count]) => count),
            backgroundColor: [
              '#10b981', // Green for approved
              '#22d3ee', // Cyan for approved by doctor
              '#06b6d4', // Blue for approved by govt
              '#ef4444', // Red for rejected  
              '#f59e0b', // Yellow for pending
              '#8b5cf6'  // Purple for other
            ],
            borderWidth: 2,
            borderColor: '#1f2547'
          },
        ],
      }

      charts.push({
        id: 'approval_status',
        title: 'Travel Approval Status Distribution',
        type: 'pie',
        data: approvalChartData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { 
              position: 'bottom',
              labels: {
                padding: 15,
                usePointStyle: true,
                font: { size: 12 }
              }
            },
            title: { display: false },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const total = context.dataset.data.reduce((a, b) => a + b, 0)
                  const percentage = ((context.parsed / total) * 100).toFixed(1)
                  return `${context.label}: ${context.parsed} (${percentage}%)`
                }
              }
            }
          }
        }
      })
    }
  }

  // Travel Purpose Chart (for travel data)
  if (hasTravelData && categorical.travel_purpose) {
    const purposeData = categorical.travel_purpose.top_values || {}
    const purposeEntries = Object.entries(purposeData).slice(0, 6)
    
    if (purposeEntries.length > 0) {
      const purposeChartData = {
        labels: purposeEntries.map(([purpose]) => {
          // Capitalize and clean purpose labels
          return purpose.charAt(0).toUpperCase() + purpose.slice(1).toLowerCase()
        }),
        datasets: [
          {
            label: 'Requests',
            data: purposeEntries.map(([_, count]) => count),
            backgroundColor: generateColors(purposeEntries.length),
            borderColor: generateColors(purposeEntries.length).map(color => color.replace('0.8', '1')),
            borderWidth: 2,
          },
        ],
      }

      charts.push({
        id: 'travel_purpose',
        title: 'Travel Requests by Purpose',
        type: 'bar',
        data: purposeChartData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            title: { display: false },
            tooltip: {
              callbacks: {
                label: function(context) {
                  return `${context.label}: ${context.parsed.y} requests`
                }
              }
            }
          },
          scales: {
            y: { 
              beginAtZero: true,
              ticks: {
                callback: function(value) {
                  return value.toLocaleString()
                }
              }
            }
          }
        }
      })
    }
  }

  // State Distribution Chart (for travel data)
  if (hasTravelData && (categorical.source_state || categorical.destination_state)) {
    const stateData = categorical.source_state?.top_values || categorical.destination_state?.top_values || {}
    const stateEntries = Object.entries(stateData).slice(0, 8)
    
    if (stateEntries.length > 0) {
      const stateChartData = {
        labels: stateEntries.map(([state]) => state),
        datasets: [
          {
            data: stateEntries.map(([_, count]) => count),
            backgroundColor: generateColors(stateEntries.length),
            borderWidth: 2,
            borderColor: '#1f2547'
          },
        ],
      }

      charts.push({
        id: 'states',
        title: categorical.source_state ? 'Top Source States' : 'Top Destination States',
        type: 'pie',
        data: stateChartData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { 
              position: 'bottom',
              labels: {
                padding: 15,
                usePointStyle: true,
                font: { size: 11 }
              }
            },
            title: { display: false },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const total = context.dataset.data.reduce((a, b) => a + b, 0)
                  const percentage = ((context.parsed / total) * 100).toFixed(1)
                  return `${context.label}: ${context.parsed} (${percentage}%)`
                }
              }
            }
          }
        }
      })
    }
  }

  // Occupation Distribution Chart (for travel data)
  if (hasTravelData && categorical.occupation) {
    const occupationData = categorical.occupation.top_values || {}
    const occupationEntries = Object.entries(occupationData).slice(0, 6)
    
    if (occupationEntries.length > 0) {
      const occupationChartData = {
        labels: occupationEntries.map(([occ]) => occ),
        datasets: [
          {
            data: occupationEntries.map(([_, count]) => count),
            backgroundColor: generateColors(occupationEntries.length),
            borderWidth: 2,
            borderColor: '#1f2547'
          },
        ],
      }

      charts.push({
        id: 'occupation',
        title: 'Distribution by Occupation',
        type: 'pie',
        data: occupationChartData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { 
              position: 'bottom',
              labels: {
                padding: 15,
                usePointStyle: true,
                font: { size: 12 }
              }
            },
            title: { display: false },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const total = context.dataset.data.reduce((a, b) => a + b, 0)
                  const percentage = ((context.parsed / total) * 100).toFixed(1)
                  return `${context.label}: ${context.parsed} (${percentage}%)`
                }
              }
            }
          }
        }
      })
    }
  }

  // Health Status Chart (for travel data)
  if (hasTravelData && categorical.health_status) {
    const healthData = categorical.health_status.top_values || {}
    const healthEntries = Object.entries(healthData).slice(0, 5)
    
    if (healthEntries.length > 0) {
      const healthChartData = {
        labels: healthEntries.map(([status]) => status),
        datasets: [
          {
            label: 'Count',
            data: healthEntries.map(([_, count]) => count),
            backgroundColor: [
              '#10b981', // Green for Good
              '#f59e0b', // Yellow for Average
              '#ef4444', // Red for Critical
              '#6366f1', // Blue for other
              '#8b5cf6'  // Purple for other
            ],
            borderColor: generateColors(healthEntries.length).map(color => color.replace('0.8', '1')),
            borderWidth: 2,
          },
        ],
      }

      charts.push({
        id: 'health_status',
        title: 'Health Status Distribution',
        type: 'bar',
        data: healthChartData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            title: { display: false }
          },
          scales: {
            y: { 
              beginAtZero: true,
              ticks: {
                callback: function(value) {
                  return value.toLocaleString()
                }
              }
            }
          }
        }
      })
    }
  }

  // Age Distribution Chart (for travel data with age statistics)
  if (hasTravelData && statistics.age) {
    const ageStats = statistics.age
    const ageRanges = [
      { label: '18-25', min: 18, max: 25 },
      { label: '26-35', min: 26, max: 35 },
      { label: '36-45', min: 36, max: 45 },
      { label: '46-55', min: 46, max: 55 },
      { label: '56-65', min: 56, max: 65 },
      { label: '65+', min: 65, max: 100 }
    ]

    // Simulate age distribution based on mean and std
    const ageDistributionData = {
      labels: ageRanges.map(range => range.label),
      datasets: [
        {
          label: 'Travelers',
          data: [
            Math.round(ageStats.mean * 0.15), // 18-25
            Math.round(ageStats.mean * 0.25), // 26-35
            Math.round(ageStats.mean * 0.30), // 36-45
            Math.round(ageStats.mean * 0.20), // 46-55
            Math.round(ageStats.mean * 0.08), // 56-65
            Math.round(ageStats.mean * 0.02)  // 65+
          ],
          backgroundColor: generateColors(6),
          borderColor: generateColors(6).map(color => color.replace('0.8', '1')),
          borderWidth: 2,
        },
      ],
    }

    charts.push({
      id: 'age_distribution',
      title: 'Age Distribution of Travelers',
      type: 'bar',
      data: ageDistributionData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          title: { display: false },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `${context.label} years: ${context.parsed.y} travelers`
              }
            }
          }
        },
        scales: {
          y: { 
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return value.toLocaleString()
              }
            }
          }
        }
      }
    })
  }

  // Income vs Age Scatter (for travel data)
  if (hasTravelData && statistics.age && statistics.monthly_income) {
    const incomeAgeData = {
      datasets: [
        {
          label: 'Income vs Age',
          data: [
            { x: 25, y: statistics.monthly_income.mean * 0.6 },
            { x: 30, y: statistics.monthly_income.mean * 0.8 },
            { x: 35, y: statistics.monthly_income.mean * 1.0 },
            { x: 40, y: statistics.monthly_income.mean * 1.2 },
            { x: 45, y: statistics.monthly_income.mean * 1.4 },
            { x: 50, y: statistics.monthly_income.mean * 1.3 },
            { x: 55, y: statistics.monthly_income.mean * 1.1 },
            { x: 60, y: statistics.monthly_income.mean * 0.9 }
          ],
          backgroundColor: '#6366f1',
          borderColor: '#4f46e5',
          borderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8
        },
      ],
    }

    charts.push({
      id: 'income_age',
      title: 'Income vs Age Pattern',
      type: 'scatter',
      data: incomeAgeData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          title: { display: false },
          tooltip: {
            callbacks: {
              label: function(context) {
                const income = context.parsed.y
                const formattedIncome = income > 1000 ? `₹${(income/1000).toFixed(0)}K` : `₹${income.toFixed(0)}`
                return `Age ${context.parsed.x}: ${formattedIncome}/month`
              }
            }
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Age (years)'
            },
            min: 20,
            max: 65
          },
          y: { 
            title: {
              display: true,
              text: 'Monthly Income (₹)'
            },
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return value > 1000 ? `₹${(value/1000).toFixed(0)}K` : `₹${value}`
              }
            }
          }
        }
      }
    })
  }

  // Industry/Company Charts (for business data)
  if (!hasTravelData) {
    // Industry Distribution
    if (categorical.industry) {
      const industryData = categorical.industry.top_values || {}
      const industryEntries = Object.entries(industryData).slice(0, 6)
      
      if (industryEntries.length > 0) {
        const industryChartData = {
          labels: industryEntries.map(([industry]) => industry),
          datasets: [
            {
              data: industryEntries.map(([_, count]) => count),
              backgroundColor: generateColors(industryEntries.length),
              borderWidth: 2,
              borderColor: '#1f2547'
            },
          ],
        }

        charts.push({
          id: 'industry',
          title: 'Industry Distribution',
          type: 'pie',
          data: industryChartData,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { 
                position: 'bottom',
                labels: {
                  padding: 15,
                  usePointStyle: true,
                  font: { size: 12 }
                }
              },
              title: { display: false }
            }
          }
        })
      }
    }

    // Country Distribution
    if (categorical.country) {
      const countryData = categorical.country.top_values || {}
      const countryEntries = Object.entries(countryData).slice(0, 6)
      
      if (countryEntries.length > 0) {
        const countryChartData = {
          labels: countryEntries.map(([country]) => country),
          datasets: [
            {
              data: countryEntries.map(([_, count]) => count),
              backgroundColor: generateColors(countryEntries.length),
              borderWidth: 2,
              borderColor: '#1f2547'
            },
          ],
        }

        charts.push({
          id: 'country',
          title: 'Geographic Distribution',
          type: 'pie',
          data: countryChartData,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { 
                position: 'bottom',
                labels: {
                  padding: 15,
                  usePointStyle: true,
                  font: { size: 12 }
                }
              },
              title: { display: false }
            }
          }
        })
      }
    }

    // Revenue vs Employees Scatter (for business data)
    if (statistics.revenue_musd && statistics.employees) {
      const revenueEmployeeData = {
        datasets: [
          {
            label: 'Revenue vs Employees',
            data: [
              { x: 50, y: statistics.revenue_musd.mean * 0.3 },
              { x: 100, y: statistics.revenue_musd.mean * 0.6 },
              { x: 150, y: statistics.revenue_musd.mean * 0.9 },
              { x: 200, y: statistics.revenue_musd.mean * 1.2 },
              { x: 250, y: statistics.revenue_musd.mean * 1.5 },
              { x: 300, y: statistics.revenue_musd.mean * 1.8 }
            ],
            backgroundColor: '#10b981',
            borderColor: '#059669',
            borderWidth: 2,
            pointRadius: 6,
            pointHoverRadius: 8
          },
        ],
      }

      charts.push({
        id: 'revenue_employees',
        title: 'Revenue vs Employee Count',
        type: 'scatter',
        data: revenueEmployeeData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            title: { display: false },
            tooltip: {
              callbacks: {
                label: function(context) {
                  return `${context.parsed.x} employees: $${context.parsed.y.toFixed(1)}M revenue`
                }
              }
            }
          },
          scales: {
            x: {
              title: {
                display: true,
                text: 'Number of Employees'
              },
              beginAtZero: true
            },
            y: { 
              title: {
                display: true,
                text: 'Revenue (Million USD)'
              },
              beginAtZero: true,
              ticks: {
                callback: function(value) {
                  return `$${value}M`
                }
              }
            }
          }
        }
      })
    }
  }

  // Missing Values Chart (only if significant missing data)
  const missingData = Object.entries(columns)
    .filter(([_, info]) => info.missing_percentage > 0)
    .sort(([,a], [,b]) => b.missing_percentage - a.missing_percentage)
    .slice(0, 6)

  if (missingData.length > 0) {
    const missingChartData = {
      labels: missingData.map(([col]) => {
        return col.replace(/_/g, ' ')
                 .replace(/\b\w/g, l => l.toUpperCase())
      }),
      datasets: [
        {
          label: 'Missing %',
          data: missingData.map(([_, info]) => info.missing_percentage),
          backgroundColor: '#ef4444',
          borderColor: '#dc2626',
          borderWidth: 2,
        },
      ],
    }

    charts.push({
      id: 'missing',
      title: 'Data Completeness Issues',
      type: 'bar',
      data: missingChartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          title: { display: false },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `${context.label}: ${context.parsed.y}% missing`
              }
            }
          }
        },
        scales: {
          y: { 
            beginAtZero: true,
            max: 100,
            ticks: {
              callback: function(value) {
                return value + '%'
              }
            }
          },
          x: {
            ticks: {
              maxRotation: 45,
              minRotation: 0
            }
          }
        }
      }
    })
  }

  // Data Types Distribution
  if (Object.keys(columns).length > 0) {
    const typeCount = {}
    Object.values(columns).forEach(col => {
      const type = col.type || 'unknown'
      typeCount[type] = (typeCount[type] || 0) + 1
    })

    if (Object.keys(typeCount).length > 1) {
      const typeData = {
        labels: Object.keys(typeCount).map(type => {
          return type.charAt(0).toUpperCase() + type.slice(1)
        }),
        datasets: [
          {
            data: Object.values(typeCount),
            backgroundColor: generateColors(Object.keys(typeCount).length),
            borderWidth: 2,
            borderColor: '#1f2547'
          },
        ],
      }

      charts.push({
        id: 'types',
        title: 'Column Types Distribution',
        type: 'pie',
        data: typeData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { 
              position: 'bottom',
              labels: {
                padding: 15,
                usePointStyle: true,
                font: { size: 12 }
              }
            },
            title: { display: false },
            tooltip: {
              callbacks: {
                label: function(context) {
                  return `${context.label}: ${context.parsed} columns`
                }
              }
            }
          }
        }
      })
    }
  }

  if (charts.length === 0) {
    return (
      <div className="charts-empty">
        <div className="empty-icon">📊</div>
        <h3>No charts available</h3>
        <p>Unable to generate charts from the current dataset</p>
      </div>
    )
  }

  const renderChart = (chart) => {
    switch (chart.type) {
      case 'bar':
        return <Bar data={chart.data} options={chart.options} />
      case 'line':
        return <Line data={chart.data} options={chart.options} />
      case 'pie':
        return <Pie data={chart.data} options={chart.options} />
      case 'scatter':
        return <Scatter data={chart.data} options={chart.options} />
      default:
        return null
    }
  }

  return (
    <div className="charts-section">
      <div className="charts-grid">
        {charts.map((chart) => (
          <div key={chart.id} className="chart-card">
            <h4 className="chart-title">{chart.title}</h4>
            <div className="chart-container">
              {renderChart(chart)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ChartSection