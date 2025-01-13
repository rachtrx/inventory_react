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
import { createNewAccessory } from "./Loan"
import DateInputControl from "../../utils/DateInputControl"

const LoanAccessories = ({accessories, loanIndex, suggestedOptions=[]}) => {

    const { handleAccessorySearch } = useFormModal();
	
	const { values, setFieldValue } = useFormikContext();
	const { warnings } = useLoan();
	const { accessoryOptions } = useLoans()
	console.log(warnings);

    const updateAccessoryFields = (loanIndex, accessoryIndex, selected) => {
		setFieldValue(`loans.${loanIndex}.accessories.${accessoryIndex}.accessoryTypeId`, selected?.accessoryTypeId || '');
	}

    return (
    <FieldArray name={`loans.${loanIndex}.accessories`}>
        {accessoryHelpers => (
            <Box>
                <HStack mb={1}>
                    {suggestedOptions && suggestedOptions.length > 0 && (
                        suggestedOptions.map((option) => (
                            <Button onClick={() => accessoryHelpers.push(createNewAccessory({accessoryTypeId: option.value, accessoryName: option.label}))}/>
                        ))
                    )}
                </HStack>
                {accessories && accessories.length > 0 && accessories.map((accessory, index, array) => {
                    // console.log(fieldName);
                    return (
                        <Box key={accessory.key}>
                            <SearchCreatableSingleSelectFormControl
                                name={`loans.${loanIndex}.accessories.${index}.accessoryName`}
                                searchFn={handleAccessorySearch}
                                updateFields={(selected) => updateAccessoryFields(loanIndex, index, selected)}
                                warning={warnings?.accessories?.[index]?.id || null}
                                initialOptions={accessoryOptions}
                            >
                                <InputFormControl
                                    name={`loans.${loanIndex}.accessories.${index}.count`} 
                                    type="number" 
                                    placeholder="Enter count" 
                                />
                                <RemoveButton
                                    ariaLabel="Remove Accessory"
                                    handleClick={() => accessoryHelpers.remove(index)}
                                />
                            </SearchCreatableSingleSelectFormControl>
                        </Box>
                    )
                })}
                {accessories && (
                    <AddButton
                        ariaLabel="Add Accessory"
                        handleClick={() => {
                            console.log('Before push:', values);
                            accessoryHelpers.push(createNewAccessory());
                            console.log('After push:', values);
                        }}
                        label={`Add Accessory`}
                        size='xs'
                    />
                )}
            </Box>
        )}
    </FieldArray>)
}

export default LoanAccessories;