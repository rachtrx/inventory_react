// theme.js
import { extendTheme } from '@chakra-ui/react';

const bodyTextColor = {
  color: "var(--chakra-colors-chakra-body-text) !important",
};

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
      bgRed: { default: 'red.100', _dark: 'red.900' },
      bgGreen: { default: 'green.100', _dark: 'green.900' },
      bgBlue: { default: 'blue.100', _dark: 'blue.900' },
      bgOrange: { default: 'orange.100', _dark: 'orange.900' },
      bgYellow: { default: 'yellow.100', _dark: 'yellow.900' },
      bgPurple: { default: 'purple.100', _dark: 'purple.900' },
      bgTeal: { default: 'teal.100', _dark: 'teal.900' },
      bgGray: { default: 'gray.100', _dark: 'gray.900' },
      bgCyan: { default: 'cyan.100', _dark: 'cyan.900' },
      bgPink: { default: 'pink.100', _dark: 'pink.900' },
      bgError: { default: 'red.100', _dark: 'red.900' },
      bgSubtle: { default: 'gray.400', _dark: 'gray.600' },

      bgRedHover: { default: 'red.200', _dark: 'red.800' },
      bgGreenHover: { default: 'green.200', _dark: 'green.800' },
      bgBlueHover: { default: 'blue.200', _dark: 'blue.800' },
      bgOrangeHover: { default: 'orange.200', _dark: 'orange.800' },
      bgYellowHover: { default: 'yellow.200', _dark: 'yellow.800' },  // already exists
      bgPurpleHover: { default: 'purple.200', _dark: 'purple.800' },
      bgTealHover: { default: 'teal.200', _dark: 'teal.800' },
      bgGrayHover: { default: 'gray.200', _dark: 'gray.800' },
      bgCyanHover: { default: 'cyan.200', _dark: 'cyan.800' },
      bgPinkHover: { default: 'pink.200', _dark: 'pink.800' },
      bgErrorHover: { default: 'red.200', _dark: 'red.800' },
      bgSubtleHover: { default: 'gray.500', _dark: 'gray.500' },


      textRed: { default: 'red.700', _dark: 'red.300' },
      textGreen: { default: 'green.700', _dark: 'green.300' },
      textBlue: { default: 'blue.700', _dark: 'blue.300' },
      textOrange: { default: 'orange.700', _dark: 'orange.300' },
      textYellow: { default: 'yellow.700', _dark: 'yellow.300' },
      textPurple: { default: 'purple.700', _dark: 'purple.300' },
      textTeal: { default: 'teal.700', _dark: 'teal.300' },
      textGray: { default: 'gray.700', _dark: 'gray.300' },
      textCyan: { default: 'cyan.700', _dark: 'cyan.300' },
      textPink: { default: 'pink.700', _dark: 'pink.300' },
      textError: { default: 'red.700', _dark: 'red.300' },
      textSubtle: { default: 'gray.600', _dark: 'gray.400' },

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
  },
  styles: {
    global: {
      ".chakra-collapse": {
        overflow: "visible !important",
      },
      ".react-select__value-container": {
        display: "flex !important",
        flexWrap: "nowrap !important",
        overflowX: "auto !important",
        paddingBottom: "20px",
        msOverflowStyle: "-ms-autohiding-scrollbar !important",
        ...bodyTextColor
      },
      ".react-select__value-container::-webkit-scrollbar": {
        height: "8px !important",
        backgroundColor: "#f4f4f4",
      },
      ".react-select__value-container::-webkit-scrollbar-thumb": {
        background: "#888 !important",
        borderRadius: "10px !important",
      },
      ".react-select__value-container::-webkit-scrollbar-thumb:hover": {
        background: "#555 !important",
      },
      ".react-select__multi-value": {
        minWidth: "auto !important",
        backgroundColor: "gray",
        ...bodyTextColor
      },
      ".react-select__menu": {
        zIndex: "9999 !important",
        backgroundColor: "white",
      },
      ".chakra-ui-dark .react-select__menu": {
        backgroundColor: "var(--chakra-colors-chakra-subtle-bg)",
      },
      ".react-select__option--is-focused": {
        backgroundColor: "white",
        color: "black",
      },
      ".chakra-ui-dark .react-select__option--is-focused": {
        backgroundColor: "#1A365D",
        color: "white",
      },
      ".react-select__option:active": {
        backgroundColor: "#bee3f8 !important",
        color: "black !important",
      },
      ".chakra-ui-dark .react-select__option:active": {
        backgroundColor: "#1A365D !important",
        color: "white !important",
      },
      ".react-select__option--is-disabled": {
        backgroundColor: "#f9f9f9",
        color: "#a0a0a0",
        cursor: "not-allowed",
      },
      ".chakra-ui-dark .react-select__option--is-disabled": {
        backgroundColor: "#2d3748", // Chakra gray.800
        color: "#718096",           // Chakra gray.400
        cursor: "not-allowed",
      },
      ".react-select__control": {
        backgroundColor: "white",
        color: "var(--chakra-colors-chakra-body-text)",
      },
      ".chakra-ui-dark .react-select__control": {
        backgroundColor: "var(--chakra-colors-chakra-subtle-bg)",
        color: "var(--chakra-colors-chakra-body-text)",
      },
      ".react-select__input": bodyTextColor,
      ".react-select__single-value": bodyTextColor,
      ".react-select__multi-value__label": bodyTextColor,
      ".react-select__placeholder": bodyTextColor,
    }
  }
  // Optional: breakpoints, spacing, radii, etc.
});

export default customTheme;
