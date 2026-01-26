import { Box, Flex, Text } from "@chakra-ui/react";
import InputFormControl from '../../utils/InputFormControl';
import { useFormikContext } from "formik";
import { RemoveButton } from "../../utils/ItemButtons";
import WarningCard from "../../utils/WarningCard";
import { useEffect } from "react";
import loanService from "../../../../services/LoanService";
import { useUpdateAccessories } from "./UpdateAccessoriesProvider";
import { AvailAccSelectFormControl } from "../../options/AvailAccessoryOptions";
import { useForm } from "../../../../context/FormProvider";
import RemarksFormControl from "../../utils/RemarksFormControl";

export const UpdateAccessory = ({
    accessory,
    accessoryHelpers,
    index, 
    children
}) => {

    const { initialValues } = useForm();
    const { values, setFieldValue } = useFormikContext();
    const { addNewAccessory, accessoryOptions, setAccessoryOptions } = useUpdateAccessories(); 

    const updateAccessoryFields = (selected) => {
		setFieldValue(`accessories.${index}.accessoryTypeId`, selected?.accessoryTypeId || '');
		setFieldValue(`accessories.${index}.stock`, selected?.stock || 0);
	}

    return (
        <Box key={accessory.key}>
            <Text fontSize="lg">{`Accessory #${index+1}`}</Text>
            <Flex direction="column" gap={1}>
                <Flex gap={4} alignItems="flex-start">
                    <AvailAccSelectFormControl
                        isDisabled={!!Object.values(initialValues?.accTypeIds || {}).length && accessory.accessoryTypeId}
                        name={`accessories.${index}.accessoryName`}
                        handleClick={(selected) => updateAccessoryFields(selected)}
                        options={accessoryOptions}
                        setOptions={setAccessoryOptions}
                        onCreate={addNewAccessory}
                        trueKey="accessoryTypeId"
                    />
                    <Flex gap={1} alignItems="center">
                        <InputFormControl
                            name={`accessories.${index}.count`}
                            type="number"
                            placeholder="Enter count"
                        />
                        <RemoveButton
                            ariaLabel="Remove Accessory"
                            handleClick={() => accessoryHelpers.remove(index)}
                            isDisabled={values.accessories.length === 1}
                        />
                    </Flex>
                </Flex>
                <RemarksFormControl name={`accessories.${index}.remarks`} label={`Update Remarks`}/>
            </Flex>
            {children}
        </Box>
    )
}