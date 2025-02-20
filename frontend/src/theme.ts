import { createTheme, responsiveFontSizes } from '@mui/material/styles';

// Define PureHD-inspired colors - Refined based on purehd.com
const pureHDPalette = {
  primary: {
    // Use the vibrant blue from 'Get a Quote' button for primary actions
    main: '#49bdf5', // PureHD Link/Accent Blue
    // Let's use a very dark blue/grey for contrast elements like AppBar bg
    dark: '#212935', // Dark Header/Footer Background
    contrastText: '#ffffff',
  },
  secondary: {
    // Use the darker blue as secondary, perhaps for outlines or secondary actions
    main: '#0a4a7a', // Darker Blue
    contrastText: '#ffffff',
  },
  background: {
    default: '#ffffff', // White background seems prevalent
    paper: '#ffffff', // White for cards/paper elements
  },
  text: {
    primary: '#212935', // Dark color for primary text
    secondary: '#5a6775', // Greyer text for secondary info
  },
  divider: 'rgba(0, 0, 0, 0.08)', // Lighter divider
  // Add other colors as needed, e.g., error, warning, info, success
  error: {
    main: '#d32f2f',
  },
  warning: {
    main: '#ffa000',
  },
  info: {
    main: '#1976d2',
  },
  success: {
    main: '#388e3c',
  },
};

// Create the theme instance
let theme = createTheme({
  palette: pureHDPalette,
  typography: {
    fontFamily: 'Poppins, Roboto, Arial, sans-serif', // Use Poppins primarily
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 500 },
    h6: { fontWeight: 500 },
    button: {
      textTransform: 'none', // Buttons without ALL CAPS
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8, // Slightly rounded corners
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          // Use the refined dark color for AppBar background
          backgroundColor: pureHDPalette.primary.dark, 
          color: pureHDPalette.primary.contrastText,
          // Remove border or make it very subtle against dark bg
          borderBottom: 'none', 
        },
      },
    },
    MuiButton: {
        styleOverrides: {
            root: {
                // Make buttons slightly less rounded, closer to website
                borderRadius: '4px', 
                padding: '6px 16px', // Standard padding
                fontWeight: 600,
                textTransform: 'uppercase', // Match website button style
            },
            // Style for contained primary buttons (like 'Get a Quote')
            containedPrimary: {
                backgroundColor: pureHDPalette.primary.main,
                color: pureHDPalette.primary.contrastText,
                '&:hover': {
                    // Slightly darker shade on hover
                    backgroundColor: '#37a8e0', 
                }
            },
            // Style for outlined secondary buttons (using the darker blue)
            outlinedSecondary: {
                 borderColor: pureHDPalette.secondary.main,
                 color: pureHDPalette.secondary.main,
                 '&:hover': {
                     backgroundColor: `${pureHDPalette.secondary.main}14`, // Faint background on hover
                     borderColor: pureHDPalette.secondary.main,
                 }
            }
            // Add overrides for text buttons if needed
        }
    },
    MuiCard: {
        styleOverrides: {
            root: {
                boxShadow: '0px 4px 12px rgba(0,0,0,0.05)', // Subtle shadow
                transition: 'box-shadow 0.3s ease-in-out',
                '&:hover': {
                     boxShadow: '0px 8px 20px rgba(0,0,0,0.1)',
                }
            }
        }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          // Add styles for specific chip colors if needed
          // Example:
          // colorSuccess: {
          //     backgroundColor: pureHDPalette.success.main,
          //     color: '#fff'
          // }
        }
      }
    }
    // Add other component overrides as needed
  },
});

// Make typography responsive
theme = responsiveFontSizes(theme);

export default theme; 