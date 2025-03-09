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
import DateInputControl from "../../utils/DateInputControl"
import { LoanAccSelectFormControl } from "./CustomSelect"

const LoanAccessory = ({accessory, field, index, helpers, children}) => {
	
	const { values, setFieldValue } = useFormikContext();
	const { warnings } = useLoan();
	const { accessoryOptions } = useLoans()
	// console.log(warnings);

    const updateAccessoryFields = (selected) => {
		setFieldValue(`${field}.accessoryTypeId`, selected?.accessoryTypeId || '');
	}

    return (
        <Box key={accessory.key}>
            <LoanAccSelectFormControl
                name={`${field}.accessoryName`}
                searchFn={accessoryService.fetchAccLoan}
                updateFields={(selected) => updateAccessoryFields(selected)}
                warning={warnings[accessory.key] || null}
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
        </Box>
    )
}

export default LoanAccessory;