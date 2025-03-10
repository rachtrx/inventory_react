import { useEffect, useState } from "react"
import { SearchCreatableSingleSelectFormControl, SearchSingleSelectFormControl } from "../../utils/SelectFormControl"
import { useFormModal } from "../../../../context/ModalProvider"
import { useUI } from "../../../../context/UIProvider"
import accessoryService from "../../../../services/AccessoryService"
import { Button, Flex, VStack, IconButton, Box, Popover, PopoverTrigger, PopoverContent, PopoverArrow, PopoverCloseButton, PopoverBody, HStack, CloseButton } from "@chakra-ui/react";
import { FieldArray } from "formik"
import InputFormControl from "../../utils/InputFormControl"
import { ResponsiveText } from "../../../utils/ResponsiveText"
import { useFormikContext } from 'formik';
import { AddButton, RemoveButton } from "../../utils/ItemButtons"
import { useLoan } from "./LoanProvider"
import { v4 as uuidv4 } from 'uuid';
import { useLoans } from "./LoansProvider"
import { createNewAccessory } from "./LoanUser"
import { LoanAccSelectFormControl } from "./CustomSelect"
import WarningCard from "../../utils/Warnings"

const LoanAccessory = ({accessory, field, index, helpers, children}) => {
	
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
            <LoanAccSelectFormControl
                name={`${field}.accessoryName`}
                searchFn={accessoryService.fetchAccLoan}
                updateFields={(selected) => updateAccessoryFields(selected)}
                initialOptions={accessoryOptions}
            >
                <InputFormControl
                    name={`${field}.count`} 
                    type="number" 
                    placeholder="Enter count" 
                />
                <RemoveButton
                    ariaLabel="Remove Accessory"
                    handleClick={() => helpers.remove(index)}
                />
            </LoanAccSelectFormControl>
            {accessory.accessoryName && !accessory.accessoryTypeId && 
                <WarningCard
                    message={`Create ${accessory.accessoryName}?`}
                    items={accessoryOptions}
                    itemAttr="value"
                    onCreate={async() => await addNewAccessory(accessory.accessoryName)}
                />
            }
        </Flex>
    )
}

export default LoanAccessory;