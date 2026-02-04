import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AppLayout from "../layout/AppLayout"
import DatasetUpload from "../components/DatasetUpload"
import DatasetCard from "../components/DatasetCard"
import { getUserDatasets } from "../api/api"
import { FiSearch, FiGrid, FiList } from "react-icons/fi"
import "./DatasetsPage.css"

function DatasetsPage() {
  const [datasets, setDatasets] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState('grid')
  const [sortBy, setSortBy] = useState('recent')
  const navigate = useNavigate()

  useEffect(() => {
    loadDatasets()
  }, [])

  const loadDatasets = async () => {
    try {
      const data = await getUserDatasets()
      setDatasets(data)
    } catch (error) {
      console.error('Failed to load datasets:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDatasetUploaded = () => {
    loadDatasets()
  }

  const handleDatasetSelect = (dataset) => {
    navigate(`/dataset/${dataset._id}`)
  }

  const filteredAndSortedDatasets = datasets
    .filter(dataset =>
      dataset.filename.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.upload_date) - new Date(a.upload_date)
        case 'name':
          return a.filename.localeCompare(b.filename)
        case 'size':
          return (b.row_count || 0) - (a.row_count || 0)
        default:
          return 0
      }
    })

  if (loading) {
    return (
      <AppLayout>
        <div className="datasets-loading">
          <div className="loading-spinner">⏳</div>
          <p>Loading datasets...</p>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="datasets-page">
        <div className="datasets-header">
          <div className="header-content">
            <h1>Datasets</h1>
            <p>Manage and analyze your data collections</p>
          </div>
        </div>

        <DatasetUpload onUploadSuccess={handleDatasetUploaded} />

        <div className="datasets-controls">
          <div className="search-section">
            <div className="search-container">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search datasets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          <div className="controls-right">
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="recent">Most Recent</option>
              <option value="name">Name A-Z</option>
              <option value="size">Largest First</option>
            </select>

            <div className="view-toggle">
              <button 
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                <FiGrid />
              </button>
              <button 
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
              >
                <FiList />
              </button>
            </div>
          </div>
        </div>

        <div className="datasets-content">
          {filteredAndSortedDatasets.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📊</div>
              <h3>No datasets found</h3>
              <p>
                {searchTerm 
                  ? `No datasets match "${searchTerm}"`
                  : "Upload your first dataset to get started"
                }
              </p>
            </div>
          ) : (
            <div className={`datasets-grid ${viewMode}`}>
              {filteredAndSortedDatasets.map((dataset) => (
                <DatasetCard
                  key={dataset._id}
                  dataset={dataset}
                  onClick={() => handleDatasetSelect(dataset)}
                  viewMode={viewMode}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}

export default DatasetsPage