import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Login from "./auth/Login"
import Signup from "./auth/Signup"
import Dashboard from "./dashboard/Dashboard"
import DatasetsPage from "./datasets/DatasetsPage"
import DatasetPage from "./dataset/DatasetPage"
import AnalyticsOverview from "./analytics/AnalyticsOverview"
import ProtectedRoute from "./components/ProtectedRoute"
import ErrorBoundary from "./components/ErrorBoundary"
import "./assets/analytics.css"
import './styles/base.css'
import './styles/variables-light.css'
import './styles/layout.css'
import './styles/navbar.css'
import './styles/sidebar.css'
import './styles/dashboard.css'
import './styles/datasets.css'
import './styles/charts.css'
import './styles/kpi.css'
import './styles/tables.css'
import './styles/animations.css'

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/datasets"
            element={
              <ProtectedRoute>
                <DatasetsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dataset/:id"
            element={
              <ProtectedRoute>
                <DatasetPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <AnalyticsOverview />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
