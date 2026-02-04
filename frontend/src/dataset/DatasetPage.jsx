import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import AppLayout from "../layout/AppLayout"
import DatasetTabs from "./DatasetTabs"
import CacheStatus from "../cache/CacheStatus"
import ExportButton from "../components/ExportButton"
import { getUserDatasets, getDatasetAnalytics } from "../api/api"
import { FiArrowLeft, FiDownload, FiRefreshCw } from "react-icons/fi"
import "./DatasetPage.css"

function DatasetPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [dataset, setDataset] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [analyticsLoading, setAnalyticsLoading] = useState(false)

  useEffect(() => {
    loadDataset()
  }, [id])

  const loadDataset = async () => {
    try {
      const datasets = await getUserDatasets()
      const foundDataset = datasets.find(d => d._id === id)
      
      if (!foundDataset) {
        navigate('/datasets')
        return
      }
      
      setDataset(foundDataset)
      await loadAnalytics(foundDataset)
    } catch (error) {
      console.error('Failed to load dataset:', error)
      navigate('/datasets')
    } finally {
      setLoading(false)
    }
  }

  const loadAnalytics = async (datasetToAnalyze = dataset) => {
    if (!datasetToAnalyze) return
    
    setAnalyticsLoading(true)
    try {
      const data = await getDatasetAnalytics(datasetToAnalyze._id)
      setAnalytics(data)
    } catch (error) {
      console.error('Failed to load analytics:', error)
    } finally {
      setAnalyticsLoading(false)
    }
  }

  const handleRecomputeAnalytics = () => {
    loadAnalytics()
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="dataset-loading">
          <div className="loading-spinner">⏳</div>
          <p>Loading dataset...</p>
        </div>
      </AppLayout>
    )
  }

  if (!dataset) {
    return (
      <AppLayout>
        <div className="dataset-error">
          <h3>Dataset not found</h3>
          <button onClick={() => navigate('/datasets')}>
            ← Back to Datasets
          </button>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="dataset-page" id="analytics-dashboard">
        <div className="dataset-header">
          <div className="header-left">
            <button 
              className="back-button"
              onClick={() => navigate('/datasets')}
            >
              <FiArrowLeft />
              Back to Datasets
            </button>
            
            <div className="dataset-title">
              <h1>{dataset.filename}</h1>
              <div className="dataset-meta">
                <span>{dataset.row_count?.toLocaleString() || 0} rows</span>
                <span>•</span>
                <span>{dataset.column_count || 0} columns</span>
                <span>•</span>
                <span>
                  {new Date(dataset.upload_date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>
            </div>
          </div>

          <div className="header-actions">
            <CacheStatus 
              datasetId={dataset._id}
              onRecompute={handleRecomputeAnalytics}
              loading={analyticsLoading}
            />
            
            <ExportButton analytics={analytics} datasetName={dataset.filename} />
            
            <button 
              className="action-btn primary"
              onClick={handleRecomputeAnalytics}
              disabled={analyticsLoading}
            >
              <FiRefreshCw className={analyticsLoading ? 'spinning' : ''} />
              {analyticsLoading ? 'Computing...' : 'Recompute'}
            </button>
          </div>
        </div>

        <DatasetTabs 
          dataset={dataset}
          analytics={analytics}
          loading={analyticsLoading}
        />
      </div>
    </AppLayout>
  )
}

export default DatasetPage