import "./SmartRecommendations.css"

function SmartRecommendations({ analytics }) {
  if (!analytics) return null

  const recommendations = []

  const health = analytics.health || {}
  const statistics = analytics.statistics || {}
  const correlations = analytics.correlation_analysis || {}
  const outliers = analytics.outlier_analysis || {}
  const columns = analytics.columns || {}

  // Missing Values
  if (health.missing_percentage > 10) {
    recommendations.push({
      type: "warning",
      title: "High Missing Values",
      text: "Dataset contains significant missing values. Consider imputation or removing incomplete rows."
    })
  }

  // Strong Correlations
  if (correlations.strong_correlations?.length > 0) {
    recommendations.push({
      type: "success",
      title: "Strong Correlations Found",
      text: `${correlations.strong_correlations.length} strong relationships detected. Great for predictive modeling.`
    })
  }

  // Outliers
  if (outliers.outlier_summary?.total_outliers > 0) {
    recommendations.push({
      type: "warning",
      title: "Outliers Detected",
      text: `Detected ${outliers.outlier_summary.total_outliers} outliers. Consider normalization or anomaly handling.`
    })
  }

  // Dataset Size
  if (analytics.summary?.total_rows < 100) {
    recommendations.push({
      type: "info",
      title: "Small Dataset",
      text: "Dataset size is small. Statistical conclusions may not generalize well."
    })
  }

  // Numerical Columns
  const numericColumns = Object.values(columns).filter(
    (c) => c.type === "numeric"
  ).length

  if (numericColumns >= 3) {
    recommendations.push({
      type: "success",
      title: "ML Ready Dataset",
      text: "Dataset has enough numerical features for machine learning workflows."
    })
  }

  // Classification Suggestion
  if (analytics.categorical && Object.keys(analytics.categorical).length > 0) {
    recommendations.push({
      type: "info",
      title: "Classification Opportunity",
      text: "Categorical columns detected. You can build classification models."
    })
  }

  // Visualization Suggestion
  recommendations.push({
    type: "info",
    title: "Visualization Recommendation",
    text: "Use dashboards and interactive charts to better identify hidden patterns."
  })

  return (
    <div className="smart-recommendations">
      <h3>🧠 Smart AI Recommendations</h3>

      <div className="recommendations-grid">
        {recommendations.map((rec, index) => (
          <div key={index} className={`recommendation-card ${rec.type}`}>
            <h4>{rec.title}</h4>
            <p>{rec.text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SmartRecommendations