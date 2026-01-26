import {
  FormControl,
  FormLabel,
  Textarea,
  Collapse,
  IconButton,
  Flex,
  FormErrorMessage,
  Text,
} from "@chakra-ui/react";
import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import { Field, useField } from "formik";
import { useState } from "react";

export default function RemarksFormControl({
  name,
  label,
  placeholder,
  disabled = false,
  isCollapsible = true
}) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [, meta] = useField(name);

  return (
    <FormControl isInvalid={meta.touched && !!meta.error}>
      <Flex alignItems="center">
        {label && (
          <FormLabel htmlFor={name}>
            <Text>{label}</Text>
          </FormLabel>
        )}
        {isCollapsible ? 
          <IconButton
            aria-label={isCollapsed ? "Expand remarks" : "Collapse remarks"}
            icon={isCollapsed ? <ChevronDownIcon /> : <ChevronUpIcon />}
            size="xs"
            variant="ghost"
            onClick={() => setIsCollapsed(!isCollapsed)}
          /> 
        : undefined}
      </Flex>
      
      {isCollapsible ? 
        <Collapse in={!isCollapsed}>
          <Field
            name={name}
            as={Textarea}
            placeholder={placeholder}
            disabled={disabled}
          />
        </Collapse> 
      : <Field
          name={name}
          as={Textarea}
          placeholder={placeholder}
          disabled={disabled}
        />
      }

      {meta.error && <FormErrorMessage>{meta.error}</FormErrorMessage>}
    </FormControl>
  );
}
