import './Logo.css';

const Logo = ({ size = 'medium', showText = true }) => {
  const sizeClass = `logo-${size}`;
  
  return (
    <div className={`logo-container ${sizeClass}`}>
      <div className="logo-icon">
        <svg viewBox="0 0 40 40" className="logo-svg">
          {/* Background circle with gradient */}
          <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--color-primary-400)" />
              <stop offset="50%" stopColor="var(--color-primary-500)" />
              <stop offset="100%" stopColor="var(--color-primary-600)" />
            </linearGradient>
            <linearGradient id="chartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--color-success-400)" />
              <stop offset="100%" stopColor="var(--color-success-500)" />
            </linearGradient>
          </defs>
          
          {/* Main circle background */}
          <circle cx="20" cy="20" r="18" fill="url(#logoGradient)" />
          
          {/* Analytics chart bars */}
          <rect x="8" y="24" width="3" height="8" fill="white" opacity="0.9" rx="1" />
          <rect x="13" y="20" width="3" height="12" fill="white" opacity="0.9" rx="1" />
          <rect x="18" y="16" width="3" height="16" fill="white" opacity="0.9" rx="1" />
          <rect x="23" y="12" width="3" height="20" fill="white" opacity="0.9" rx="1" />
          <rect x="28" y="18" width="3" height="14" fill="white" opacity="0.9" rx="1" />
          
          {/* Insight "eye" or "spark" element */}
          <circle cx="20" cy="12" r="2" fill="white" opacity="0.95" />
          <circle cx="20" cy="12" r="1" fill="url(#logoGradient)" />
          
          {/* Data connection lines */}
          <path d="M 12 8 Q 20 4 28 8" stroke="white" strokeWidth="1.5" fill="none" opacity="0.7" />
          <circle cx="12" cy="8" r="1.5" fill="white" opacity="0.8" />
          <circle cx="28" cy="8" r="1.5" fill="white" opacity="0.8" />
        </svg>
      </div>
      
      {showText && (
        <div className="logo-text">
          <span className="logo-name">InsightX</span>
          <span className="logo-tagline">AI Analytics</span>
        </div>
      )}
    </div>
  );
};

export default Logo;