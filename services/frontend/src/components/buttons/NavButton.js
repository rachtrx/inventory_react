import { Button } from '@chakra-ui/react';

export default function NavButton({ next, icon, label }) {
  
  return (
    <Button
      leftIcon={icon} // Use the icon prop for the left icon
      variant="ghost"
      onClick={next}
    >
      {label}
    </Button>
  );
};