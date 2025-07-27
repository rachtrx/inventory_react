import { FormControl, FormErrorMessage, FormLabel, Input, Text } from '@chakra-ui/react';
import { useField } from 'formik';

// Chakra-styled version of the date input

const DateInputControl = ({ label, name, placeholder }) => {

  const [field, meta] = useField(name);

  // useEffect(() => {
  //   console.log(meta.error);
  //   console.log(meta.touched);
  // }, [meta])

  return (
    <FormControl isInvalid={meta.touched && !!meta.error}>
      {label && <FormLabel><Text>{label}</Text></FormLabel>}
      <Input {...field} placeholder='Select Date and Time' size='md' type='date' />
      {meta.error && (
        <FormErrorMessage>{meta.error}</FormErrorMessage>
      )}
    </FormControl>
  );
};

export default DateInputControl;