import { useState, useEffect } from 'react'
import AppLayout from "../layout/AppLayout"
import KpiCards from "./KpiCards"
import RecentDatasets from "./RecentDatasets"
import DatasetUpload from "../components/DatasetUpload"
import SystemStatus from "./SystemStatus"
import { getUserDatasets } from "../api/api"
import "./Dashboard.css"

function Dashboard() {
  const [datasets, setDatasets] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalDatasets: 0,
    totalRows: 0,
    totalColumns: 0,
    avgHealthScore: 0
  })

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const data = await getUserDatasets()
      setDatasets(data)
      
      // Calculate stats
      const totalDatasets = data.length
      const totalRows = data.reduce((sum, dataset) => sum + (dataset.row_count || 0), 0)
      const totalColumns = data.reduce((sum, dataset) => sum + (dataset.column_count || 0), 0)
      const avgHealthScore = data.length > 0 
        ? Math.round(data.reduce((sum, dataset) => sum + (dataset.health_score || 85), 0) / data.length)
        : 0

      setStats({
        totalDatasets,
        totalRows,
        totalColumns,
        avgHealthScore
      })
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDatasetUploaded = () => {
    loadDashboardData()
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="dashboard-loading">
          <div className="loading-spinner">⏳</div>
          <p>Loading dashboard...</p>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="dashboard">
        <div className="dashboard-header">
          <h1>Analytics Dashboard</h1>
          <p>Transform your data into powerful insights with AI-powered analytics</p>
        </div>

        <KpiCards stats={stats} />

        <div className="dashboard-grid">
          <div className="dashboard-main">
            <DatasetUpload onUploadSuccess={handleDatasetUploaded} />
            <RecentDatasets datasets={datasets.slice(0, 5)} />
          </div>
          
          <div className="dashboard-sidebar">
            <SystemStatus />
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

export default Dashboard