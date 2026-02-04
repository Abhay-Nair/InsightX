import { useState, useEffect } from 'react'
import { getDatasetPreview } from '../api/api'
import { FiSearch } from 'react-icons/fi'
import "./DataPreview.css"

function DataPreview({ dataset }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadPreviewData()
  }, [dataset])

  const loadPreviewData = async () => {
    if (!dataset) return
    
    try {
      const previewData = await getDatasetPreview(dataset._id)
      setData(previewData)
    } catch (error) {
      console.error('Failed to load preview data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getColumnType = (values) => {
    if (!values || values.length === 0) return 'text'
    
    const sample = values.find(v => v !== null && v !== undefined && v !== '')
    if (!sample) return 'text'
    
    if (!isNaN(sample) && !isNaN(parseFloat(sample))) return 'number'
    if (new Date(sample).toString() !== 'Invalid Date') return 'date'
    return 'text'
  }

  const filterData = () => {
    if (!data || !data.data) return []
    
    let filteredData = data.data
    
    // Apply search filter
    if (searchTerm) {
      filteredData = filteredData.filter(row =>
        Object.values(row).some(value =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    }
    
    return filteredData
  }

  if (loading) {
    return (
      <div className="excel-loading">
        <div className="loading-spinner">⏳</div>
        <p>Loading spreadsheet...</p>
      </div>
    )
  }

  if (!data || !data.data || data.data.length === 0) {
    return (
      <div className="excel-empty">
        <div className="empty-icon">📊</div>
        <h3>No data available</h3>
        <p>This spreadsheet appears to be empty</p>
      </div>
    )
  }

  const filteredData = filterData()
  const columns = data.columns || Object.keys(data.data[0] || {})

  return (
    <div className="excel-container">
      {/* Excel-style toolbar */}
      <div className="excel-toolbar">
        <div className="toolbar-left">
          <span className="data-info">
            {filteredData.length.toLocaleString()} rows × {columns.length} columns
          </span>
        </div>
        
        <div className="toolbar-right">
          <div className="search-container">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search in spreadsheet..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
      </div>

      {/* Excel-style spreadsheet */}
      <div className="excel-spreadsheet">
        <div className="spreadsheet-container">
          <table className="excel-table">
            <thead>
              <tr>
                <th className="row-number-header"></th>
                {columns.map((column, index) => (
                  <th key={column} className="excel-column-header">
                    <div className="column-header-content">
                      <div className="column-letter">{String.fromCharCode(65 + (index % 26))}</div>
                      <div className="column-name">{column}</div>
                      <div className={`column-type ${getColumnType(data.data.map(row => row[column]))}`}>
                        {getColumnType(data.data.map(row => row[column]))}
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row, rowIndex) => (
                <tr key={rowIndex} className="excel-row">
                  <td className="excel-row-number">
                    {rowIndex + 1}
                  </td>
                  {columns.map((column, colIndex) => (
                    <td key={column} className="excel-cell">
                      <div className="cell-content">
                        {row[column] === null || row[column] === undefined || row[column] === ''
                          ? ''
                          : String(row[column])
                        }
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default DataPreview