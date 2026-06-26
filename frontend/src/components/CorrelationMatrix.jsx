import { useMemo } from 'react';
import './CorrelationMatrix.css';

const CorrelationMatrix = ({ correlationData }) => {
  const { correlation_matrix, strong_correlations, correlation_summary } = correlationData || {};

  const getCorrelationStrength = (absValue) => {
    if (absValue >= 0.9) return 'very-strong';
    if (absValue >= 0.7) return 'strong';
    if (absValue >= 0.5) return 'moderate';
    if (absValue >= 0.3) return 'weak';
    return 'very-weak';
  };

  const getCorrelationColor = (value) => {
    if (value === null || value === undefined) return '#374151';

    const intensity = Math.abs(value);

    if (value > 0) {
      return `rgba(59, 130, 246, ${intensity})`;
    } else {
      return `rgba(239, 68, 68, ${intensity})`;
    }
  };

  const matrixData = useMemo(() => {
    try {
      if (!correlation_matrix) {
        return null;
      }

      const columns = Object.keys(correlation_matrix);

      if (columns.length === 0) {
        return null;
      }

      const matrix = [];

      columns.forEach((col1, i) => {
        columns.forEach((col2, j) => {
          const value = correlation_matrix[col1]?.[col2];

          if (value !== null && value !== undefined) {
            matrix.push({
              x: j,
              y: i,
              value: value,
              col1,
              col2,
              strength: getCorrelationStrength(Math.abs(value))
            });
          }
        });
      });

      return { matrix, columns };

    } catch (error) {
      console.error("Correlation matrix error:", error);
      return null;
    }
  }, [correlation_matrix]);

  console.log("MATRIX DATA:", matrixData)
  console.log("RAW CORRELATION MATRIX:", correlation_matrix)
  if (!matrixData || !matrixData.matrix || matrixData.matrix.length === 0) {
  return (
        <div className="correlation-matrix-empty">
        <div className="empty-icon">📊</div>
        <h3>No Correlation Data</h3>
        <p>Not enough numeric columns for correlation analysis</p>
      </div>
    );
  }

  const { matrix, columns } = matrixData;

  try {
    return (
      <div className="correlation-matrix-container">
        <div className="correlation-header">
          <h3>Correlation Matrix</h3>
          <div className="correlation-legend">
            <div className="legend-item">
              <div className="legend-color positive"></div>
              <span>Positive</span>
            </div>
            <div className="legend-item">
              <div className="legend-color negative"></div>
              <span>Negative</span>
            </div>
            <div className="legend-scale">
              <span>-1</span>
              <div className="scale-bar"></div>
              <span>0</span>
              <div className="scale-bar"></div>
              <span>+1</span>
            </div>
          </div>
        </div>

        <div className="correlation-matrix">
        <div className="column-labels">
          {columns.map((col, index) => (
            <div key={index} className="column-label">
              {col}
            </div>
          ))}
        </div>

        {columns.map((row, rowIndex) => (
          <div key={rowIndex} className="matrix-row">

            <div className="row-label">
              {row}
            </div>

            <div className="matrix-cells">
              {columns.map((col, colIndex) => {
                const value = correlation_matrix[row]?.[col]

                return (
                  <div
                    key={colIndex}
                    className="matrix-cell"
                    style={{
                      backgroundColor: getCorrelationColor(value)
                    }}
                    title={`${row} vs ${col}: ${value?.toFixed(3)}`}
                  >
                    {value?.toFixed(2)}
                  </div>
                )
              })}
            </div>

          </div>
        ))}
      </div>

        {strong_correlations && strong_correlations.length > 0 && (
          <div className="strong-correlations">
            <h4>Strong Correlations</h4>
            <div className="correlations-list">
              {strong_correlations.slice(0, 5).map((corr, index) => (
                <div key={index} className="correlation-item">
                  <div className="correlation-pair">
                    <span className="column-name">{corr.column1}</span>
                    <span className="correlation-arrow">↔</span>
                    <span className="column-name">{corr.column2}</span>
                  </div>
                  <div className="correlation-details">
                    <span className={`correlation-value ${corr.direction}`}>
                      {corr.correlation?.toFixed(3)}
                    </span>
                    <span className={`correlation-strength ${corr.strength}`}>
                      {corr.strength?.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {correlation_summary && (
          <div className="correlation-summary">
            <div className="summary-stats">
              <div className="stat-item">
                <span className="stat-label">Total Pairs</span>
                <span className="stat-value">{correlation_summary.total_pairs}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Strong Positive</span>
                <span className="stat-value positive">{correlation_summary.strong_positive}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Strong Negative</span>
                <span className="stat-value negative">{correlation_summary.strong_negative}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Moderate</span>
                <span className="stat-value">{correlation_summary.moderate_correlations}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  } catch (error) {
    return (
      <div className="correlation-matrix-empty">
        <div className="empty-icon">❌</div>
        <h3>Error Rendering Correlation Matrix</h3>
        <p>There was an error displaying the correlation data.</p>
      </div>
    );
  }
};

export default CorrelationMatrix;