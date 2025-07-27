// theme.js
import { extendTheme } from '@chakra-ui/react';

const customTheme = extendTheme({
  initialColorMode: "light",
  useSystemColorMode: false,
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
  semanticTokens: {
    colors: {
      subtle: {
        default: 'gray.400',
        _dark: 'gray.600',
      },
      error: {
        default: 'red.100',
        _dark: 'red.900',
      },
      red: {
        default: 'red.100',
        _dark: 'red.900',
      },
      redHover: {
        default: 'red.200',
        _dark: 'red.800',
      },
      green: {
        default: 'green.100',
        _dark: 'green.900',
      },
      blue: {
        default: 'blue.100',
        _dark: 'blue.900',
      },
      orange: {
        default: 'orange.100',
        _dark: 'orange.900',
      },
      yellow: {
        default: 'yellow.100',
        _dark: 'yellow.900',
      },
      yellowHover: {
        default: 'yellow.200',
        _dark: 'yellow.800',
      },
      purple: {
        default: 'purple.100',
        _dark: 'purple.900',
      },
      gray: {
        default: 'gray.100',
        _dark: 'gray.900',
      },
      LOAN: {
        default: 'blue.100',
        _dark: 'blue.900',
      },
      RELOAN: {
        default: 'blue.100',
        _dark: 'blue.900',
      },
      RETURN: {
        default: 'orange.100',
        _dark: 'orange.900',
      },
      ADD_ASSET: {
        default: 'green.100',
        _dark: 'green.900',
      },
      DEL_ASSET: {
        default: 'red.100',
        _dark: 'red.900',
      },
      TAG_ASSET: {
        default: 'purple.100',
        _dark: 'purple.900',
      },
      UNTAG_ASSET: {
        default: 'pink.100',
        _dark: 'pink.900',
      },
      ADD_USER: {
        default: 'green.100',
        _dark: 'green.900',
      },
      DEL_USER: {
        default: 'red.100',
        _dark: 'red.900',
      },
      TAG_USER: {
        default: 'purple.100',
        _dark: 'purple.900',
      },
      UNTAG_USER: {
        default: 'pink.100',
        _dark: 'pink.900',
      },
      UPDATE_ACC: {
        default: 'cyan.200',
        _dark: 'cyan.800',
      },
      RESERVE: {
        default: 'yellow.200',
        _dark: 'yellow.800',
      },
    }
  }
  // Optional: breakpoints, spacing, radii, etc.
});

export default customTheme;
