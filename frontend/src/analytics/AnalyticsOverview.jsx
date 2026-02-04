import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllDatasets } from '../api/api';
import AppLayout from '../layout/AppLayout';
import './AnalyticsOverview.css';

const AnalyticsOverview = () => {
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadDatasets();
  }, []);

  const loadDatasets = async () => {
    try {
      setLoading(true);
      const data = await getAllDatasets();
      setDatasets(data);
    } catch (err) {
      setError('Failed to load datasets');
      console.error('Error loading datasets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDatasetClick = (dataset) => {
    navigate(`/dataset/${dataset._id}`);
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="analytics-overview">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <h3>Loading Analytics Overview...</h3>
            <p>Gathering insights from your datasets</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="analytics-overview">
          <div className="error-state">
            <div className="error-icon">⚠️</div>
            <h3>Unable to Load Analytics</h3>
            <p>{error}</p>
            <button onClick={loadDatasets} className="retry-button">
              Try Again
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="analytics-overview">
        <div className="analytics-header">
          <div className="header-content">
            <h1>Analytics Overview</h1>
            <p>Explore insights and patterns across all your datasets</p>
          </div>
          <div className="header-stats">
            <div className="stat-card">
              <div className="stat-number">{datasets.length}</div>
              <div className="stat-label">Total Datasets</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">
                {datasets.reduce((sum, d) => sum + (d.row_count || 0), 0).toLocaleString()}
              </div>
              <div className="stat-label">Total Records</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">
                {datasets.reduce((sum, d) => sum + (d.column_count || 0), 0)}
              </div>
              <div className="stat-label">Total Columns</div>
            </div>
          </div>
        </div>

        {datasets.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <h3>No Datasets Available</h3>
            <p>Upload your first dataset to start generating analytics insights</p>
            <button 
              onClick={() => navigate('/datasets')} 
              className="upload-button"
            >
              Upload Dataset
            </button>
          </div>
        ) : (
          <div className="datasets-grid">
            {datasets.map((dataset) => (
              <div 
                key={dataset._id} 
                className="dataset-analytics-card"
                onClick={() => handleDatasetClick(dataset)}
              >
                <div className="card-header">
                  <div className="dataset-icon">📈</div>
                  <div className="dataset-info">
                    <h3>{dataset.filename}</h3>
                    <p className="dataset-date">
                      Uploaded {new Date(dataset.uploaded_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="card-metrics">
                  <div className="metric">
                    <span className="metric-label">Rows</span>
                    <span className="metric-value">
                      {(dataset.row_count || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Columns</span>
                    <span className="metric-value">{dataset.column_count || 0}</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Size</span>
                    <span className="metric-value">
                      {dataset.file_size ? `${(dataset.file_size / 1024).toFixed(1)} KB` : 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="card-actions">
                  <button className="analyze-button">
                    <span>View Analytics</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M7 17L17 7M17 7H7M17 7V17"/>
                    </svg>
                  </button>
                </div>

                <div className="card-preview">
                  <div className="preview-chart">
                    {/* Simple preview visualization */}
                    <div className="mini-bars">
                      {[...Array(8)].map((_, i) => (
                        <div 
                          key={i} 
                          className="mini-bar" 
                          style={{ 
                            height: `${Math.random() * 60 + 20}%`,
                            animationDelay: `${i * 0.1}s`
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="analytics-features">
          <h2>Available Analytics Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Descriptive Statistics</h3>
              <p>Mean, median, mode, standard deviation, and quartile analysis</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Data Quality Assessment</h3>
              <p>Missing values, duplicates, and data health scoring</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📈</div>
              <h3>Visual Analytics</h3>
              <p>Interactive charts, graphs, and data visualizations</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔍</div>
              <h3>Pattern Detection</h3>
              <p>Categorical distributions and correlation analysis</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🏢</div>
              <h3>Domain-Specific Insights</h3>
              <p>Specialized analytics for business and travel data</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Performance Optimized</h3>
              <p>Cached results and efficient processing for large datasets</p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default AnalyticsOverview;