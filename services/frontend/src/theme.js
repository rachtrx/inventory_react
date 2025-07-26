// theme.js
import { extendTheme } from '@chakra-ui/react';

const customTheme = extendTheme({
  fonts: {
    heading: `'Inter', sans-serif`,
    body: `'Inter', sans-serif`,
  },
  fontSizes: {
    xs: '10px',
    sm: '12px',
    md: '14px',
    lg: '16px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '30px',
    '4xl': '36px',
  },
  colors: {
    brand: {
      50: '#e3f9ff',
      100: '#c8eaff',
      200: '#a5dcff',
      300: '#7fcdff',
      400: '#5abfff',
      500: '#31b0ff',
      600: '#2390db',
      700: '#186eb7',
      800: '#0c4c93',
      900: '#02326f',
    },
  },
  // Optional: breakpoints, spacing, radii, etc.
});

export default customTheme;
