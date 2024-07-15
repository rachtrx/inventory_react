import { useFormikContext } from 'formik';
import { Button } from '@chakra-ui/react';

const ToggleButton = ({ label, name }) => {
  const { values, setFieldValue } = useFormikContext();
  const value = values[name];

  return (
    <Button
      onClick={() => setFieldValue(name, !value)}
      bg={value ? 'purple.400' : 'gray.200'}
      color={value ? 'white' : 'black'}
      _hover={{ bg: value ? 'purple.500' : 'gray.300' }}
      _active={{ bg: value ? 'purple.600' : 'gray.400' }}
    >
      {label}
    </Button>
  );
};

export default ToggleButton;