import { Box, Flex, Text } from "@chakra-ui/react";
import InputFormControl from '../../utils/InputFormControl';
import { useFormikContext } from "formik";
import { RemoveButton } from "../../utils/ItemButtons";
import WarningCard from "../../utils/WarningCard";
import { useEffect } from "react";
import loanService from "../../../../services/LoanService";
import { useUpdateAccessories } from "./UpdateAccessoriesProvider";
import { AvailAccSelectFormControl } from "../../options/AvailAccessoryOptions";
import { useFormModal } from "../../../../context/ModalProvider";
import RemarksFormControl from "../../utils/RemarksFormControl";

export const UpdateAccessory = ({
    accessory,
    accessoryHelpers,
    index, 
    children
}) => {

    const { initialValues } = useFormModal();
    const { values, setFieldValue } = useFormikContext();
    const { addNewAccessory, accessoryOptions } = useUpdateAccessories(); 

    const updateAccessoryFields = (selected) => {
		setFieldValue(`accessories.${index}.accessoryTypeId`, selected?.accessoryTypeId || '');
		setFieldValue(`accessories.${index}.stock`, selected?.stock || 0);
	}

    useEffect(() => {
        console.log(accessoryOptions);
        if (!accessory.accessoryName || accessory.accessoryTypeId) return;
        const matchedOption = accessoryOptions.find(option => option.accessoryTypeId && option.value === accessory.accessoryName);
        if(matchedOption) setFieldValue(`accessories.${index}.accessoryTypeId`, matchedOption.accessoryTypeId);
    }, [accessoryOptions, setFieldValue, accessory, index]);

    return (
        <Box key={accessory.key}>
            <Text fontSize="lg">{`Accessory #${index+1}`}</Text>
            <Flex direction="column" gap={1}>
                <Flex gap={4} alignItems="flex-start">
                    <AvailAccSelectFormControl
                        isDisabled={!!Object.values(initialValues || {}).length}
                        name={`accessories.${index}.accessoryName`}
                        searchFn={loanService.fetchAccLoan} // TODO create a shared name?
                        updateFields={(selected) => updateAccessoryFields(selected)}
                        initialOptions={accessoryOptions}
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
                {accessory.accessoryName && !accessory.accessoryTypeId && 
                    <WarningCard
                        message={`Create ${accessory.accessoryName}?`}
                        items={accessoryOptions}
                        itemAttr="value"
                        onCreate={async() => await addNewAccessory(accessory.accessoryName)}
                    />
                }
                <RemarksFormControl name={`accessories.${index}.remarks`} label={`Update Remarks`}/>
            </Flex>
            {children}
        </Box>
    )
}