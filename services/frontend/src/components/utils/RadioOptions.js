import { Radio, RadioGroup, Stack } from "@chakra-ui/react";
import { useField } from "formik";
import { ResponsiveText } from "./ResponsiveText";

const RadioOptions = ({ name, updateOptions }) => {
    const [field, meta, helpers] = useField(name);
  
    return (
        <RadioGroup
            {...field}
            onChange={(val) => helpers.setValue(val)}
            onBlur={field.onBlur}
            value={field.value}
            name={name}
        >
            <Stack direction="row" bg="white" p={4} borderRadius="md" boxShadow="md">
            {updateOptions.map((opt) => (
                <Radio key={opt.value} value={opt.value}>
                    <ResponsiveText size='xs'>{opt.label}</ResponsiveText>
                </Radio>
            ))}
            </Stack>
        </RadioGroup>
    );
};

export default RadioOptions;