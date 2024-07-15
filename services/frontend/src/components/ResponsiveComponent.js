import { useBreakpointValue } from '@chakra-ui/react';

export default function ResponsiveComponent({MobileComponent, DesktopComponent}) {
  const isMobile = useBreakpointValue({ base: true, md: false });

  return (
    <div>
      {isMobile ? (
        <MobileComponent/>
      ) : (
        <DesktopComponent/>
      )}
    </div>
  );
}
