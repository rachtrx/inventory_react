import React, { createContext, useContext } from 'react';
import { useBreakpointValue } from '@chakra-ui/react';

const ResponsiveContext = createContext();

export function useResponsive() {
  const context = useContext(ResponsiveContext);
  if (!context) {
    throw new Error('useResponsive must be used within a ResponsiveProvider');
  }
  return context;
}

export const ResponsiveProvider = ({ children }) => {

	const isIpad = useBreakpointValue({ base: false, md: true, lg: true, xl: false });
  const isMobile = useBreakpointValue({ base: true, md: false, lg: false, xl: false });

  const headerSize = useBreakpointValue({
    base: 'md',
    md: 'lg',
    lg: 'xl'
  });

  const textSize = useBreakpointValue({
    base: 'xs',
    md: 'sm',
    lg: 'md'
  });

  return (
    <ResponsiveContext.Provider value={{ isIpad, isMobile, headerSize, textSize }}>
      {children}
    </ResponsiveContext.Provider>
  );
};