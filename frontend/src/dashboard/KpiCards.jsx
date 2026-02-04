import { FiDatabase, FiGrid, FiColumns, FiActivity } from "react-icons/fi"
import "./KpiCards.css"

function KpiCards({ stats }) {
  const kpis = [
    {
      title: "Total Datasets",
      value: stats.totalDatasets,
      icon: FiDatabase,
      color: "primary",
      change: "+12%",
      changeType: "positive"
    },
    {
      title: "Total Rows",
      value: stats.totalRows.toLocaleString(),
      icon: FiGrid,
      color: "accent",
      change: "+8.2%",
      changeType: "positive"
    },
    {
      title: "Total Columns",
      value: stats.totalColumns.toLocaleString(),
      icon: FiColumns,
      color: "success",
      change: "+5.1%",
      changeType: "positive"
    },
    {
      title: "Avg Health Score",
      value: `${stats.avgHealthScore}%`,
      icon: FiActivity,
      color: "warning",
      change: stats.avgHealthScore >= 80 ? "+2.3%" : "-1.2%",
      changeType: stats.avgHealthScore >= 80 ? "positive" : "negative"
    }
  ]

  return (
    <div className="kpi-cards">
      {kpis.map((kpi, index) => (
        <div key={index} className={`kpi-card ${kpi.color}`}>
          <div className="kpi-header">
            <div className="kpi-icon">
              <kpi.icon />
            </div>
            <div className={`kpi-change ${kpi.changeType}`}>
              {kpi.change}
            </div>
          </div>
          
          <div className="kpi-content">
            <h3 className="kpi-value">{kpi.value}</h3>
            <p className="kpi-title">{kpi.title}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export default KpiCards