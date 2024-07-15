import React from 'react';
import { Field } from 'formik';
import { FormControl, FormLabel, Select } from '@chakra-ui/react';

export default function SelectFormControl({ name, label, placeholder, options }) {
  return (
    <FormControl id={name}>
      {label ? <FormLabel htmlFor={name}>{label}</FormLabel> : ''}
      <Field name={name} as={Select} placeholder={placeholder}>
        {options?.map((option, index) => (
          <option key={index} value={option.value}>{option.label}</option>
        ))}
      </Field>
    </FormControl>
  );
}