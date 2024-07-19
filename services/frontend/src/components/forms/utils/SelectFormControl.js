import React, { useRef, useCallback, useState } from 'react';
import { Field, useField } from 'formik';
import Select, { components } from 'react-select';
import { FormControl, FormLabel } from '@chakra-ui/react';

const withSelect = (Component) => ({ name, label, options = [], placeholder, isMulti = false, disabled = false, ...props }) => {
  const [, , { setValue }] = useField(name);
  const selectRef = useRef();

  const handleChange = (value) => {
    if (isMulti) {
      setValue(value ? value.map(v => v.value) : []);
    } else {
      setValue(value ? value.value : '');
    }
  };

  const getValue = (value) => {
    if (isMulti) {
      return options ? options.filter(option => value.includes(option.value)) : [];
    } else {
      return options ? options.find(option => option.value === value) : null;
    }
  };

  return (
    <FormControl id={name}>
      {label && <FormLabel htmlFor={name}>{label}</FormLabel>}
      <Field name={name}>
        {({ field }) => (
          <Component
            ref={selectRef}
            classNamePrefix="react-select"
            name={name}
            options={options}
            placeholder={placeholder}
            isMulti={isMulti}
            isDisabled={disabled}
            onChange={handleChange}
            value={getValue(field.value)}
            hideSelectedOptions={false}
            isSearchable
            {...props}
          />
        )}
      </Field>
    </FormControl>
  );
};

const SingleSelect = withSelect(Select);
export const SingleSelectFormControl = (props) => {
  const [displayValue, setDisplayValue] = useState(true);

  const handleMenuOpen = useCallback(() => setDisplayValue(false), []);
  const handleMenuClose = useCallback(() => setDisplayValue(true), []);

  return (
    <SingleSelect 
      {...props}
      onMenuOpen={handleMenuOpen}
      onMenuClose={handleMenuClose}
      components={{
        SingleValue: (props) => displayValue ? <components.SingleValue {...props} /> : null,
      }}
      isMulti={false}
    />
  );
};

const MultiSelect = withSelect(Select);
export const MultiSelectFormControl = (props) => {
  return (
    <MultiSelect 
      {...props}
      isMulti={true}
    />
  );
};
