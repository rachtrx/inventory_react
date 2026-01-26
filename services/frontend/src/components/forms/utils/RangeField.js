import React, { useState } from "react";
import { Field, ErrorMessage, useFormikContext } from "formik";
import { Box, FormControl, FormErrorMessage, FormLabel, Text } from "@chakra-ui/react";
import { Range } from "react-range";

export const RangeField = ({ label, range = [], name }) => {
    const min = range.length ? Math.min(...range) : null;
    const max = range.length ? Math.max(...range) : null;

    const { values } = useFormikContext();

    if (!Number.isFinite(min) || !Number.isFinite(max) || min >= max) {
        return null;
    }

    return (
        <FormControl mb={4}>
            {label && <FormLabel>{label}</FormLabel>}

            <Box textAlign="center" mb={2}>
                <Text>Min: {values[name]?.[0] || min} | Max: {values[name]?.[1] || max}</Text>
            </Box>

            <Field name={name}>
                {({ field, form }) => (
                    <Range
                        step={1}
                        min={min}
                        max={max}
                        values={field.value || [min, max]} // Persist previous values
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
                        renderThumb={({ props }) => {
                            const { key, ...restProps } = props;
                            return (
                                <Box
                                    key={key}
                                    {...restProps}
                                    w="16px"
                                    h="16px"
                                    bg="blue.500"
                                    borderRadius="full"
                                    cursor="pointer"
                                />
                            );
                        }}
                        
                    />
                )}
            </Field>

            <FormErrorMessage>
                <ErrorMessage name={name} />
            </FormErrorMessage>
        </FormControl>
    );
};
