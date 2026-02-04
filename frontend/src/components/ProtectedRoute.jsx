import { Navigate } from "react-router-dom"
import { isAuthenticated } from "../utils/auth"

function ProtectedRoute({ children }) {
  const authenticated = isAuthenticated()

  if (!authenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute
