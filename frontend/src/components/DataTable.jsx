import { useState, useEffect } from 'react'
import { getDatasetPreview } from '../api/api'

function DataTable({ dataset }) {
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPreview()
  }, [dataset])

  const loadPreview = async () => {
    try {
      const data = await getDatasetPreview(dataset._id)
      setPreview(data)
    } catch (error) {
      console.error('Failed to load preview:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="data-loading">Loading data preview...</div>
  }

  if (!preview || !preview.data) {
    return <div className="data-error">No data available</div>
  }

  const columns = preview.columns || []
  const rows = preview.data || []

  return (
    <div className="data-tab">
      <div className="data-header">
        <h3>Data Preview</h3>
        <p>Showing first {rows.length} rows of {dataset.filename}</p>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((column, index) => (
                <th key={index}>{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((column, colIndex) => (
                  <td key={colIndex}>
                    {row[column] !== null && row[column] !== undefined 
                      ? String(row[column]) 
                      : <span className="null-value">null</span>
                    }
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default DataTable