// Theme utility functions
export const THEMES = {
  DARK: 'dark',
  LIGHT: 'light'
};

export const getStoredTheme = () => {
  try {
    return localStorage.getItem('theme') || THEMES.DARK;
  } catch (error) {
    console.warn('Failed to get theme from localStorage:', error);
    return THEMES.DARK;
  }
};

export const setStoredTheme = (theme) => {
  try {
    localStorage.setItem('theme', theme);
  } catch (error) {
    console.warn('Failed to save theme to localStorage:', error);
  }
};

export const applyTheme = (theme) => {
  const root = document.documentElement;
  
  if (theme === THEMES.LIGHT) {
    root.setAttribute('data-theme', 'light');
  } else {
    root.removeAttribute('data-theme');
  }
  
  setStoredTheme(theme);
};

export const initializeTheme = () => {
  const storedTheme = getStoredTheme();
  applyTheme(storedTheme);
  return storedTheme;
};

export const toggleTheme = (currentTheme) => {
  const newTheme = currentTheme === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK;
  applyTheme(newTheme);
  return newTheme;
};