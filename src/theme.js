import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#800000', 
    },
    secondary: {
      main: '#fa5f22ff', // A deep pink
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    // Add more typography customizations as needed
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8, // Rounded buttons
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12, // More rounded cards
          boxShadow: '0px 4px 20px rgba(219, 35, 35, 0.05)',
        },
      },
    },
    // Customize other components
  },
});

export default theme;