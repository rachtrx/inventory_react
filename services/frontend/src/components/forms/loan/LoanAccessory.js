import { useEffect } from "react"
import { Flex } from "@chakra-ui/react";
import InputFormControl from "../utils/InputFormControl"
import { useFormikContext } from 'formik';
import { RemoveButton } from "../utils/ItemButtons"
import { useLoans } from "./LoansProvider"
import { AvailAccSelectFormControl } from "../options/AvailAccessoryOptions"
import WarningCard from "../utils/WarningCard"
import loanService from "../../../services/LoanService"

const LoanAccessory = ({ accessory, field, index, helpers, autoFocus }) => {
	
	const { setFieldValue } = useFormikContext();
	const { accessoryOptions, addNewAccessory } = useLoans()

    const updateAccessoryFields = (selected) => {
		setFieldValue(`${field}.accessoryTypeId`, selected?.accessoryTypeId || '');
	}

    useEffect(() => {
        console.log(accessoryOptions);
        if (!accessory.accessoryName || accessory.accessoryTypeId) return;
        const matchedOption = accessoryOptions.find(option => option.accessoryTypeId && option.value === accessory.accessoryName);
        if(matchedOption) setFieldValue(`${field}.accessoryTypeId`, matchedOption.accessoryTypeId);
    }, [accessoryOptions, setFieldValue, accessory, field]);

    return (
        <Flex direction="column" key={accessory.key}>
            <Flex direction="column" gap={1}>
                <AvailAccSelectFormControl
                    name={`${field}.accessoryName`}
                    searchFn={loanService.fetchAccLoan}
                    autoFocus={autoFocus}
                    updateFields={(selected) => updateAccessoryFields(selected)}
                    initialOptions={accessoryOptions}
                    errorAbove={true}
                />
                <Flex gap={1} alignItems="center">
                    <InputFormControl
                        name={`${field}.count`} 
                        type="number" 
                        placeholder="Enter count" 
                    />
                    <RemoveButton
                        ariaLabel="Remove Accessory"
                        handleClick={() => helpers.remove(index)}
                    />
                </Flex>
            </Flex>
            {accessory.accessoryName && !accessory.accessoryTypeId && 
                <WarningCard
                    message={`Create ${accessory.accessoryName}?`}
                    items={accessoryOptions}
                    itemAttr="value"
                    onCreate={async () => await addNewAccessory(accessory.accessoryName)}
                />
            }
        </Flex>
    )
}

export default LoanAccessory;