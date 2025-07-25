import { useEffect } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import { FormControl, FormErrorMessage, FormLabel, Input } from '@chakra-ui/react';
import { useField } from 'formik';
import { ResponsiveText } from '../../utils/ResponsiveText';

// Chakra-styled version of the date input

const DateInputControl = ({ label, name, placeholder }) => {

  const [field, meta] = useField(name);

  // useEffect(() => {
  //   console.log(meta.error);
  //   console.log(meta.touched);
  // }, [meta])

  return (
    <FormControl isInvalid={meta.touched && !!meta.error}>
      {label && <FormLabel><ResponsiveText>{label}</ResponsiveText></FormLabel>}
      <Input {...field} placeholder='Select Date and Time' size='md' type='date' />
      {meta.error && (
        <FormErrorMessage>{meta.error}</FormErrorMessage>
      )}
    </FormControl>
  );
};

export default DateInputControl;