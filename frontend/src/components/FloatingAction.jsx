import { useState } from 'react'

function FloatingAction() {
  const [isOpen, setIsOpen] = useState(false)

  const actions = [
    { icon: '📊', label: 'New Analysis', action: () => window.location.href = '/datasets' },
    { icon: '📈', label: 'Export Data', action: () => alert('Export feature coming soon!') },
    { icon: '🔄', label: 'Refresh', action: () => window.location.reload() },
    { icon: '❓', label: 'Help', action: () => alert('Help documentation coming soon!') }
  ]

  return (
    <div className="floating-action-container">
      {isOpen && (
        <div className="action-menu">
          {actions.map((action, index) => (
            <button
              key={index}
              className="action-item"
              onClick={action.action}
              style={{
                animationDelay: `${index * 0.1}s`,
                animation: 'slideInUp 0.3s ease forwards'
              }}
              title={action.label}
            >
              {action.icon}
            </button>
          ))}
        </div>
      )}
      
      <button 
        className={`floating-action ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? '✕' : '⚡'}
      </button>
    </div>
  )
}

export default FloatingAction