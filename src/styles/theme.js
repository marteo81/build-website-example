// Theme matching the web app's design
export const theme = {
  colors: {
    primary: '#007bff',
    primaryDark: '#0056b3',
    secondary: '#6c757d',
    background: '#f8f9fa',
    surface: '#ffffff',
    text: '#212529',
    textSecondary: '#6c757d',
    border: '#dee2e6',
    success: '#28a745',
    warning: '#ffc107',
    danger: '#dc3545',
    gradient: {
      start: '#007bff',
      end: '#0056b3'
    }
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40
  },
  
  typography: {
    h1: {
      fontSize: 32,
      fontWeight: 'bold',
      color: '#212529'
    },
    h2: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#212529'
    },
    h3: {
      fontSize: 20,
      fontWeight: '600',
      color: '#212529'
    },
    body: {
      fontSize: 16,
      color: '#212529'
    },
    caption: {
      fontSize: 14,
      color: '#6c757d'
    }
  },
  
  shadows: {
    small: {
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3
    },
    medium: {
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 5
    }
  },
  
  borderRadius: {
    small: 4,
    medium: 8,
    large: 12
  }
}; 