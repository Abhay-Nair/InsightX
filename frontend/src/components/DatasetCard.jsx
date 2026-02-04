import { motion } from "framer-motion"
import { FiDatabase, FiActivity } from "react-icons/fi"

function DatasetCard({ dataset, onClick, index, viewMode = 'grid' }) {

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })

  const formatFileSize = (bytes) => {
    if (!bytes) return "—"
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`
  }

  const isProcessed = dataset.status === "processed" || true // Default to processed

  const handleClick = (e) => {
    e.preventDefault()
    if (onClick) {
      onClick(dataset)
    }
  }

  const handleAnalyticsClick = (e) => {
    e.stopPropagation()
    handleClick(e)
  }

  if (viewMode === 'list') {
    return (
      <motion.div
        className="dataset-card list-view"
        onClick={handleClick}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.02 }}
        whileHover={{ scale: 1.01 }}
      >
        <div className="card-content-list">
          <div className="card-icon">
            <FiDatabase />
          </div>
          <div className="card-info">
            <h4>{dataset.filename}</h4>
            <div className="card-meta">
              <span>{dataset.row_count?.toLocaleString() || 0} rows</span>
              <span>•</span>
              <span>{dataset.column_count || 0} columns</span>
              <span>•</span>
              <span>{formatDate(dataset.upload_date)}</span>
            </div>
          </div>
          <div className="card-status">
            <span className={`status-pill ${isProcessed ? "ok" : "pending"}`}>
              {isProcessed ? "Processed" : "Processing"}
            </span>
          </div>
          <button className="card-action-list" onClick={handleAnalyticsClick}>
            <FiActivity />
            View Analytics
          </button>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      className="dataset-card"
      onClick={handleClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.03 }}
    >
      {/* HEADER */}
      <div className="card-top">
        <div className="card-title">
          <FiDatabase />
          <h4>{dataset.filename}</h4>
        </div>

        <span className={`status-pill ${isProcessed ? "ok" : "pending"}`}>
          {isProcessed ? "Processed" : "Processing"}
        </span>
      </div>

      {/* META */}
      <div className="card-meta">
        <span>{formatFileSize(dataset.file_size)}</span>
        <span>Uploaded {formatDate(dataset.upload_date)}</span>
      </div>

      {/* STATS */}
      <div className="card-stats">
        <div className="stat">
          <h3>{dataset.row_count?.toLocaleString() || 0}</h3>
          <p>Rows</p>
        </div>
        <div className="stat">
          <h3>{dataset.column_count || 0}</h3>
          <p>Columns</p>
        </div>
      </div>

      {/* ACTION */}
      <button className="card-action" onClick={handleAnalyticsClick}>
        <FiActivity />
        View Analytics
      </button>
    </motion.div>
  )
}

export default DatasetCard
