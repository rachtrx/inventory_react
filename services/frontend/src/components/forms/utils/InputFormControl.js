import React from 'react';
import { Field } from 'formik';
import { FormControl, FormLabel, Input, Textarea } from '@chakra-ui/react';

export default function InputFormControl({ name, label, placeholder, disabled=false }) {

  return (
    <FormControl id={name}>
      {label ? <FormLabel htmlFor={name}>{label}</FormLabel> : ''}
      <Field 
        name={name} 
        as={name === 'remarks' ? Textarea : Input } 
        placeholder={placeholder}
        disabled={disabled}
        bg="white"
      />
    </FormControl>
  );
}