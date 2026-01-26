import { Checkbox, CheckboxGroup, FormControl, FormLabel, Stack } from "@chakra-ui/react"
import { Field } from "formik";

export const CheckboxGroupField = ({ label, name, items, labAttr="label", valAttr="value"}) => {

    return items?.length ? (
        <FormControl mb={4}>
            {label && <FormLabel>{label}</FormLabel>}
            <Field name={name}>
                {({ field, form }) => (
                    <CheckboxGroup
                        {...field}
                        value={field.value || []}
                        onChange={(selected) => form.setFieldValue(field.name, selected)}
                    >
                        <Stack spacing={2} mb={4}>
                            {items.map((item) => (
                                <Checkbox key={item[valAttr]} value={item[valAttr]}>
                                    {item[labAttr]}
                                </Checkbox>
                            ))}
                        </Stack>
                    </CheckboxGroup>
                )}
            </Field>
        </FormControl>
    ) : <></>
}