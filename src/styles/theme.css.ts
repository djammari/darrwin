import { createTheme } from '@vanilla-extract/css';

export const [themeClass, vars] = createTheme({
  color: {
    primary: '#1976d2',
    secondary: '#dc004e',
    success: '#2e7d32',
    warning: '#ed6c02',
    error: '#d32f2f',
    background: '#ffffff',
    surface: '#f5f5f5',
    text: {
      primary: 'rgba(0, 0, 0, 0.87)',
      secondary: 'rgba(0, 0, 0, 0.6)',
      disabled: 'rgba(0, 0, 0, 0.38)',
    },
  },
  space: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
  },
  shadow: {
    sm: '0 1px 3px rgba(0, 0, 0, 0.12)',
    md: '0 4px 6px rgba(0, 0, 0, 0.12)',
    lg: '0 10px 25px rgba(0, 0, 0, 0.12)',
  },
});

// Veterinary-specific color palette
export const vetColors = {
  // Calming colors for animals
  calm: {
    blue: '#e3f2fd',
    green: '#e8f5e8',
    lavender: '#f3e5f5',
  },
  // Status colors for appointments
  appointment: {
    scheduled: '#2196f3',
    inProgress: '#ff9800',
    completed: '#4caf50',
    cancelled: '#f44336',
    rescheduled: '#9c27b0',
  },
  // Priority levels
  priority: {
    low: '#4caf50',
    medium: '#ff9800',
    high: '#f44336',
    urgent: '#d32f2f',
  },
};
