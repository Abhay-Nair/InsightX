import Sidebar from "./Sidebar"
import "./AppLayout.css"

function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="app-content">
        {children}
      </main>
    </div>
  )
}

export default AppLayout