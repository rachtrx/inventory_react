import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FormControl, FormLabel, Input } from '@chakra-ui/react';
import { chakra } from "@chakra-ui/react";
import { useField, useFormikContext } from 'formik';

// Chakra-styled version of the date input
const ChakraDatePicker = chakra(DatePicker);

const DateInputControl = ({ label, name }) => {

  const { setFieldValue } = useFormikContext();
  const [field] = useField(name);

  return (
    <FormControl>
      <FormLabel>{label}</FormLabel>
      <ChakraDatePicker
        {...field}
        selected={(field.value && new Date(field.value)) || null}
        onChange={val => setFieldValue(name, val)}
        customInput={<Input />}
        dateFormat="MMMM d, yyyy"
      />
    </FormControl>
  );
};

export default DateInputControl;