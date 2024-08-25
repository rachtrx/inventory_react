import { useState } from 'react';
import { FormControl, FormLabel, Input, Textarea, Collapse, IconButton, Box } from '@chakra-ui/react';
import { Field } from 'formik';
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import { ResponsiveText } from '../../utils/ResponsiveText';

export default function InputFormControl({ name, label, placeholder, disabled = false }) {
  const [isCollapsed, setIsCollapsed] = useState(true);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <FormControl id={name}>
      <Box display="flex" alignItems="center">
        {label && (
          <FormLabel htmlFor={name} mb={0}>
            <ResponsiveText>{label}</ResponsiveText>
          </FormLabel>
        )}
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
          bg="white"
        />
      )}
    </FormControl>
  );
}