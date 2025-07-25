import { Box, Flex } from "@chakra-ui/react";
import InputFormControl from '../../utils/InputFormControl';
import { SearchCreatableSingleSelectFormControl } from "../../utils/SelectFormControl";
import { useFormikContext } from "formik";
import { ResponsiveText } from "../../../utils/ResponsiveText";
import { RemoveButton } from "../../utils/ItemButtons";
import WarningCard from "../../utils/WarningCard";
import { useEffect } from "react";
import loanService from "../../../../services/LoanService";

export const UpdateAccessory = ({
    accessory, 
    accessoryOptions,
    addNewAccessory,
    accessoryHelpers,
    index, 
    children
}) => {

    const { values, setFieldValue } = useFormikContext();

    const updateAccessoryFields = (selected) => {
		setFieldValue(`accessories.${index}.accessoryTypeId`, selected?.accessoryTypeId || '');
	}

    useEffect(() => {
        console.log(accessoryOptions);
        if (!accessory.accessoryName || accessory.accessoryTypeId) return;
        const matchedOption = accessoryOptions.find(option => option.accessoryTypeId && option.value === accessory.accessoryName);
        if(matchedOption) setFieldValue(`accessories.${index}.accessoryTypeId`, matchedOption.accessoryTypeId);
    }, [accessoryOptions, setFieldValue, accessory, index]);

    return (
        <Box key={accessory.key}>
            <ResponsiveText size="lg">{`Accessory #${index+1}`}</ResponsiveText>
            <Flex direction="column" gap={2}>
                <Flex gap={4} alignItems="flex-start">
                    <SearchCreatableSingleSelectFormControl
                        name={`accessories.${index}.accessoryName`}
                        searchFn={loanService.fetchAccLoan} // TODO create a shared name?
                        updateFields={(selected) => updateAccessoryFields(selected)}
                        initialOptions={accessoryOptions}
                    >
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
                    </SearchCreatableSingleSelectFormControl>
                </Flex>
                {accessory.accessoryName && !accessory.accessoryTypeId && 
                    <WarningCard
                        message={`Create ${accessory.accessoryName}?`}
                        items={accessoryOptions}
                        itemAttr="value"
                        onCreate={async() => await addNewAccessory(accessory.accessoryName)}
                    />
                }
                <InputFormControl name={`accessories.${index}.remarks`} label={`Update Remarks`}/>
            </Flex>
            {children}
        </Box>
    )
}