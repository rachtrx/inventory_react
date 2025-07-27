import {
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  Text,
} from "@chakra-ui/react";
import { Field, useField } from "formik";

export default function InputFormControl({
  name,
  label,
  placeholder,
  disabled = false,
  type = "text",
  max,
  min,
}) {
  const [, meta] = useField(name);

  return (
    <FormControl isInvalid={meta.touched && !!meta.error}>
      {label && (
        <FormLabel htmlFor={name}>
          <Text>{label}</Text>
        </FormLabel>
      )}
      <Field
        name={name}
        as={Input}
        placeholder={placeholder}
        disabled={disabled}
        type={type}
        max={max}
        min={min}
        bg="white"
      />
      {meta.error && <FormErrorMessage>{meta.error}</FormErrorMessage>}
    </FormControl>
  );
}
