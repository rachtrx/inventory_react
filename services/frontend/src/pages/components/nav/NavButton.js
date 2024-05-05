import { useNavigate } from 'react-router-dom';
import { Button } from '@chakra-ui/react';

export default function NavButton({ link, icon, label }) {
  let navigate = useNavigate();

  const handleNavigation = () => {
    navigate(link); // Navigate to the provided link
  };

  return (
    <Button
      leftIcon={icon} // Use the icon prop for the left icon
      variant="ghost"
      onClick={handleNavigation}
    >
      {label}
    </Button>
  );
};