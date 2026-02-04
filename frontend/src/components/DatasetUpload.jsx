import { useState } from 'react'
import { uploadDataset } from '../api/api'

function DatasetUpload({ onUploadSuccess }) {
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleFileSelect = (selectedFile) => {
    if (selectedFile && (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv'))) {
      setFile(selectedFile)
      setUploadProgress(0)
    } else {
      showNotification('Please select a CSV file', 'error')
    }
  }

  const showNotification = (message, type = 'info') => {
    // Create a temporary notification
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
    }, 3000)
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    setUploadProgress(0)

    // Simulate progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return prev
        }
        return prev + Math.random() * 20
      })
    }, 200)

    try {
      await uploadDataset(file)
      setUploadProgress(100)
      setTimeout(() => {
        setFile(null)
        setUploadProgress(0)
        onUploadSuccess()
        showNotification('Dataset uploaded successfully!', 'success')
      }, 500)
    } catch (error) {
      console.error('Upload failed:', error)
      showNotification('Upload failed. Please try again.', 'error')
      setUploadProgress(0)
    } finally {
      clearInterval(progressInterval)
      setUploading(false)
    }
  }

  return (
    <div className="upload-section">
      <h3>Upload Dataset</h3>
      
      <div 
        className={`upload-area ${dragActive ? 'drag-active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="upload-content">
          <div className="upload-icon">
            {dragActive ? '🎯' : '📊'}
          </div>
          <p>
            {dragActive 
              ? 'Drop your CSV file here!' 
              : 'Drag & drop your CSV file here'
            }
          </p>
          <p>or</p>
          <input
            type="file"
            accept=".csv"
            onChange={(e) => handleFileSelect(e.target.files[0])}
            style={{ display: 'none' }}
            id="file-input"
          />
          <label htmlFor="file-input" className="upload-button">
            Choose File
          </label>
        </div>
      </div>

      {file && (
        <div className="file-info">
          <div className="file-details">
            <div className="file-icon">📄</div>
            <div className="file-meta">
              <p><strong>{file.name}</strong></p>
              <p>Size: {(file.size / 1024 / 1024).toFixed(2)} MB</p>
              <p>Modified: {new Date(file.lastModified).toLocaleDateString()}</p>
            </div>
          </div>
          
          {uploading && (
            <div className="progress-container">
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <span className="progress-text">{Math.round(uploadProgress)}%</span>
            </div>
          )}
          
          <button 
            onClick={handleUpload} 
            disabled={uploading}
            className="upload-submit"
          >
            {uploading ? 'Uploading...' : 'Upload & Analyze'}
          </button>
        </div>
      )}
    </div>
  )
}

export default DatasetUpload