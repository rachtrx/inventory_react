// theme.js or theme.ts
import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  colors: {
    rose: {
      50: "#ffe4e6",
      100: "#fecdd3",
      200: "#fda4af",
      300: "#fb7185",
      400: "#f43f5e",
      500: "#e11d48",
      600: "#be123c",
      700: "#9f1239",
      800: "#881337",
      900: "#4c0519",
    },
    fuchsia: {
      50: "#fdf4ff",
      100: "#fae8ff",
      200: "#f5d0fe",
      300: "#f0abfc",
      400: "#e879f9",
      500: "#d946ef",
      600: "#c026d3",
      700: "#a21caf",
      800: "#86198f",
      900: "#701a75",
    },
    plum: {
      50: "#f3e8ff",
      100: "#e9d5ff",
      200: "#d8b4fe",
      300: "#c084fc",
      400: "#a855f7",
      500: "#9333ea",
      600: "#7e22ce",
      700: "#6b21a8",
      800: "#581c87",
      900: "#3b0764",
    },
  },
});

export default theme;
