import { FormControl, FormErrorMessage, FormLabel, Input, Text } from '@chakra-ui/react';
import { useField } from 'formik';

// Chakra-styled version of the date input

const DateInputControl = ({ label, name, placeholder }) => {

  const [field, meta] = useField(name);
  const { value, ...rest } = field;

  return (
    <FormControl isInvalid={meta.touched && !!meta.error}>
      {label && <FormLabel><Text>{label}</Text></FormLabel>}
      <Input
        {...rest}
        value={
          field.value
            ? new Date(field.value).toISOString().split('T')[0] // Format to "YYYY-MM-DD"
            : ''
        }
        placeholder='Select Date and Time'
        size='md'
        type='date'
      />
      {meta.error && (
        <FormErrorMessage>{meta.error}</FormErrorMessage>
      )}
    </FormControl>
  );
};

export default DateInputControl;