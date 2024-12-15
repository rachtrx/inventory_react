import { useState } from 'react';
import { FormControl, FormLabel, Input, Textarea, Collapse, IconButton, Box, FormErrorMessage } from '@chakra-ui/react';
import { Field, useField } from 'formik';
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import { ResponsiveText } from '../../utils/ResponsiveText';

export default function InputFormControl({
  name,
  label,
  placeholder,
  disabled = false,
  type = 'text', // Add type with a default value of 'text'
  max, // Add max value
  min, // Add min value
}) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [field, meta] = useField(name);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <FormControl id={name} isInvalid={meta.touched && !!meta.error}>
      <Box display="flex" alignItems="center">
        {label && (
          <FormLabel htmlFor={name}>
            <ResponsiveText>{label}</ResponsiveText>
          </FormLabel>
        )}

        {/* logic to add which chevron icon given remarks */}
        {name.includes('remarks') && (
          <IconButton
            aria-label={isCollapsed ? 'Expand remarks' : 'Collapse remarks'}
            icon={isCollapsed ? <ChevronDownIcon /> : <ChevronUpIcon />}
            size="sm"
            variant="ghost"
            onClick={toggleCollapse}
          />
        )}
      </Box>

      {/* Logic to render type of input (Text Area for Remarks) */}
      {name.includes('remarks') ? (
        <Collapse in={!isCollapsed}>
          <Field
            name={name}
            as={Textarea}
            placeholder={placeholder}
            disabled={disabled}
            bg="white"
            mt={2}
          />
        </Collapse>
      ) : (
        <Field
          name={name}
          as={Input}
          placeholder={placeholder}
          disabled={disabled}
          type={type} // Set input type
          max={max} // Set max value
          min={min} // Set min value
          bg="white"
        />
      )}
      {meta.error && (
        <FormErrorMessage>{meta.error}</FormErrorMessage>
      )}
    </FormControl>
  );
}
