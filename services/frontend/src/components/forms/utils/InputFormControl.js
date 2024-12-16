import { useState } from 'react';
import { Field as ChakraField, Input, Textarea, Collapsible, IconButton, Box, Text } from '@chakra-ui/react';
import { Field, useField } from 'formik';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
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
    <ChakraField id={name} label={label} isInvalid={meta.touched && !!meta.error}>
      <Box display="flex" alignItems="center">

        {/* logic to add which chevron icon given remarks */}
        {name.includes('remarks') && (
          <IconButton
            aria-label={isCollapsed ? 'Expand remarks' : 'Collapse remarks'}
            icon={isCollapsed ? <FiChevronDown /> : <FiChevronUp />}
            size="sm"
            variant="ghost"
            onClick={toggleCollapse}
          />
        )}
      </Box>

      {/* Logic to render type of input (Text Area for Remarks) */}
      {name.includes('remarks') ? (
        <Collapsible.Root in={!isCollapsed}>
          <Collapsible.Content>
            <Field
              name={name}
              as={Textarea}
              placeholder={placeholder}
              disabled={disabled}
              bg="white"
              mt={2}
            />
          </Collapsible.Content>
        </Collapsible.Root>
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
        <Text>{meta.error}</Text>
      )}
    </ChakraField>
  );
}
