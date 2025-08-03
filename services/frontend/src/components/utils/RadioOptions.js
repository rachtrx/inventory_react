import { Radio, RadioGroup, Stack, Text } from "@chakra-ui/react";
import { useField } from "formik";

const RadioOptions = ({ name, updateOptions }) => {
    const [field, meta, helpers] = useField(name);
  
    return (
        <RadioGroup
            {...field}
            onChange={(val) => helpers.setValue(val)}
            onBlur={field.onBlur}
            value={field.value}
            name={name}
            zIndex={1}
        >
            <Stack direction="row" bg="bgRed" p={4} borderRadius="md" boxShadow="md">
            {updateOptions.map((opt) => (
                <Radio key={opt.value} value={opt.value}>
                    <Text fontSize='xs'>{opt.label}</Text>
                </Radio>
            ))}
            </Stack>
        </RadioGroup>
    );
};

export default RadioOptions;