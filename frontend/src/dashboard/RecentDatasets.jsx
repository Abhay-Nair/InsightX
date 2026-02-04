import { FiDatabase, FiArrowRight, FiCalendar } from "react-icons/fi"
import { useNavigate } from "react-router-dom"
import "./RecentDatasets.css"

function RecentDatasets({ datasets }) {
  const navigate = useNavigate()

  const handleDatasetClick = (dataset) => {
    navigate(`/dataset/${dataset._id}`)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (datasets.length === 0) {
    return (
      <div className="recent-datasets">
        <div className="section-header">
          <h3>Recent Datasets</h3>
          <button 
            className="view-all-btn"
            onClick={() => navigate('/datasets')}
          >
            View All <FiArrowRight />
          </button>
        </div>
        
        <div className="empty-state">
          <FiDatabase className="empty-icon" />
          <h4>No datasets yet</h4>
          <p>Upload your first dataset to get started with analytics</p>
        </div>
      </div>
    )
  }

  return (
    <div className="recent-datasets">
      <div className="section-header">
        <h3>Recent Datasets</h3>
        <button 
          className="view-all-btn"
          onClick={() => navigate('/datasets')}
        >
          View All <FiArrowRight />
        </button>
      </div>

      <div className="datasets-list">
        {datasets.map((dataset) => (
          <div 
            key={dataset._id} 
            className="dataset-item"
            onClick={() => handleDatasetClick(dataset)}
          >
            <div className="dataset-icon">
              <FiDatabase />
            </div>
            
            <div className="dataset-info">
              <h4 className="dataset-name">{dataset.filename}</h4>
              <div className="dataset-meta">
                <span>{dataset.row_count?.toLocaleString() || 0} rows</span>
                <span>•</span>
                <span>{dataset.column_count || 0} columns</span>
              </div>
            </div>
            
            <div className="dataset-date">
              <FiCalendar />
              <span>{formatDate(dataset.upload_date)}</span>
            </div>
            
            <div className="dataset-action">
              <FiArrowRight />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default RecentDatasets