import React, { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Field as ChakraField, Input, Text } from '@chakra-ui/react';
import { chakra } from "@chakra-ui/react";
import { useField, useFormikContext } from 'formik';
import { ResponsiveText } from '../../utils/ResponsiveText';

// Chakra-styled version of the date input
const ChakraDatePicker = chakra(DatePicker);

const DateInputControl = ({ label, name }) => {

  const { setFieldValue, setFieldTouched } = useFormikContext();
  const [field, meta] = useField(name);

  const setValue = (name, val) => {
    console.log(name);
    console.log(val);
    setFieldValue(name, val);
    setFieldTouched(name, true);
  }

  useEffect(() => {
    console.log(meta.error);
    console.log(meta.touched);
  }, [meta])

  return (
    <ChakraField label={label} isInvalid={meta.touched && !!meta.error}>
      <ChakraDatePicker
        {...field}
        selected={(field.value && new Date(field.value)) || null}
        onChange={val => setValue(name, val)}
        customInput={<Input />}
        dateFormat="MMMM d, yyyy"
        portal 
      />
      {meta.error && (
        <Text>{meta.error}</Text>
      )}
    </ChakraField>
  );
};

export default DateInputControl;