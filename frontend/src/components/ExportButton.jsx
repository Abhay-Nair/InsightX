import { useState } from 'react';
import { exportToPDF, exportToExcel, exportToCSV } from '../utils/exportUtils';
import './ExportButton.css';

const ExportButton = ({ analytics, datasetName = 'dataset' }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleExport = async (type) => {
    setIsExporting(true);
    setShowDropdown(false);
    
    try {
      const filename = `${datasetName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_analytics`;
      
      switch (type) {
        case 'pdf':
          await exportToPDF('analytics-dashboard', filename);
          break;
        case 'excel':
          await exportToExcel(analytics, filename);
          break;
        case 'csv':
          await exportToCSV(analytics, filename);
          break;
        default:
          throw new Error('Unknown export type');
      }
      
      // Show success message (you can replace with toast notification)
      console.log(`Successfully exported as ${type.toUpperCase()}`);
    } catch (error) {
      console.error('Export failed:', error);
      alert(`Export failed: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="export-button-container">
      <button
        className="export-button"
        onClick={() => setShowDropdown(!showDropdown)}
        disabled={isExporting || !analytics}
      >
        {isExporting ? (
          <>
            <div className="export-spinner"></div>
            Exporting...
          </>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7,10 12,15 17,10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Export Report
          </>
        )}
      </button>

      {showDropdown && (
        <div className="export-dropdown">
          <button
            className="export-option"
            onClick={() => handleExport('pdf')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10,9 9,9 8,9"/>
            </svg>
            Export as PDF
          </button>
          
          <button
            className="export-option"
            onClick={() => handleExport('excel')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
              <rect x="8" y="13" width="8" height="7"/>
            </svg>
            Export as Excel
          </button>
          
          <button
            className="export-option"
            onClick={() => handleExport('csv')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
              <line x1="9" y1="15" x2="15" y2="15"/>
            </svg>
            Export as CSV
          </button>
        </div>
      )}
    </div>
  );
};

export default ExportButton;