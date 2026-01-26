import { Field } from "formik";
import { Checkbox, FormControl, FormLabel } from "@chakra-ui/react";

const CheckboxField = ({ name, label }) => (
    
    <Field name={name}>
        {({ field, form }) => (
            <FormControl display="flex" alignItems="center">
                <Checkbox
                    {...field}
                    isChecked={field.value}
                    onChange={(e) => form.setFieldValue(field.name, e.target.checked)}
                >
                    {label}
                </Checkbox>
            </FormControl>
        )}
    </Field>
);

export default CheckboxField;
