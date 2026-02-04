# Theme System Documentation

## Overview
The webapp now supports both dark and light themes with a seamless toggle system.

## Features
- **Dark Theme (Default)**: Professional dark interface with blue accents
- **Light Theme**: Clean light interface with the same color palette
- **Theme Toggle**: Located in the navbar for easy switching
- **Persistence**: Theme preference is saved in localStorage
- **Smooth Transitions**: All theme changes are animated

## How It Works

### CSS Variables System
- **Base Variables**: Comprehensive color palette in `styles/variables.css`
- **Light Theme**: Override variables in `styles/variables-light.css`
- **Shorthand Variables**: Easy-to-use shortcuts like `--bg`, `--text`, `--primary`

### Theme Switching
- Uses `data-theme="light"` attribute on the `<html>` element
- JavaScript utilities in `utils/theme.js` handle theme logic
- `ThemeToggle` component provides the UI control

### File Structure
```
frontend/src/
├── styles/
│   ├── variables.css          # Dark theme (default)
│   └── variables-light.css    # Light theme overrides
├── components/
│   ├── ThemeToggle.jsx        # Theme toggle button
│   └── ThemeToggle.css        # Toggle button styles
└── utils/
    └── theme.js               # Theme utilities
```

## Usage

### Using Theme Variables in CSS
```css
.my-component {
  background: var(--bg);
  color: var(--text);
  border: 1px solid var(--color-border-primary);
}
```

### Available Shorthand Variables
- `--bg`: Main background color
- `--surface`: Card/surface background
- `--card`: Elevated card background
- `--text`: Primary text color
- `--muted`: Secondary text color
- `--primary`: Primary brand color
- `--danger`: Error/danger color
- `--success`: Success color
- `--warning`: Warning color

### Theme Utilities
```javascript
import { toggleTheme, getStoredTheme, applyTheme } from '../utils/theme';

// Get current theme
const currentTheme = getStoredTheme();

// Toggle theme
const newTheme = toggleTheme(currentTheme);

// Apply specific theme
applyTheme('light');
```

## Customization

### Adding New Colors
1. Add to both `variables.css` and `variables-light.css`
2. Create shorthand variable if needed
3. Use throughout components

### Extending Themes
- Add new theme files (e.g., `variables-blue.css`)
- Update theme utilities to support new themes
- Modify toggle component for multiple options

## Browser Support
- Modern browsers with CSS custom properties support
- Graceful fallback to dark theme if localStorage fails