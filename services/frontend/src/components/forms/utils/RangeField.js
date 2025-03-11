import React from "react";
import { Field, ErrorMessage } from "formik";
import { Box, FormControl, FormErrorMessage, FormLabel, Text } from "@chakra-ui/react";
import { Range } from "react-range";

export const RangeField = ({ label, range=[], name }) => {

    const min = Math.min(...range) || 0;
    const max = Math.max(...range) || 100;

    return (
        <FormControl mb={4}>
            {label && <FormLabel>Min & Max Count</FormLabel>}

            <Box textAlign="center" mb={2}>
                <Text>Min: {min} | Max: {max}</Text>
            </Box>

            <Field name={name}>
                {({ field, form }) => (
                    <Range
                        step={1}
                        min={min}
                        max={max}
                        values={field.value || [min, max]} // Ensure default values
                        onChange={(newValues) => {
                            form.setFieldValue(field.name, newValues); // Update Formik field
                        }}
                        renderTrack={({ props, children }) => (
                            <Box
                                {...props}
                                h="6px"
                                bg="gray.300"
                                borderRadius="full"
                                w="full"
                                position="relative"
                            >
                                {children}
                            </Box>
                        )}
                        renderThumb={({ props }) => (
                            <Box
                                {...props}
                                w="16px"
                                h="16px"
                                bg="blue.500"
                                borderRadius="full"
                                cursor="pointer"
                            />
                        )}
                    />
                )}
            </Field>

            {/* Display Formik validation error if any */}
            <FormErrorMessage>
                <ErrorMessage name="range" />
            </FormErrorMessage>
        </FormControl>
    );
};
