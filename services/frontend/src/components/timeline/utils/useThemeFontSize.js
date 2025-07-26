import { useTheme } from '@chakra-ui/react';

export const useThemeFontSize = (size) => {
  const theme = useTheme();
  return theme.fontSizes?.[size] || theme.fontSizes.md;
};
