import { useEffect, useState } from "react"
import { CreatableSingleSelectFormControl, PeripheralSearchFormControl, SearchFormControl, SingleSelectFormControl } from "./utils/SelectFormControl"
import { useFormModal } from "../../context/ModalProvider"
import { useUI } from "../../context/UIProvider"
import peripheralService from "../../services/PeripheralService"
import { Button, Flex, VStack, IconButton, Box, Popover, PopoverTrigger, PopoverContent, PopoverArrow, PopoverCloseButton, PopoverBody, HStack } from "@chakra-ui/react";
import { MdRemoveCircleOutline, MdSave } from 'react-icons/md';
import { FieldArray } from "formik"
import InputFormControl from "./utils/InputFormControl"
import { ResponsiveText } from "../utils/ResponsiveText"
import { useFormikContext } from 'formik';
import { v4 as uuidv4 } from 'uuid';
import { warning } from "framer-motion"

export const createNewPeripheral = (id='') => ({
    'key': uuidv4(),
	'id': id,
	'count': 1,
    'isNew': true
})

export const LoanAssetPeripherals = function({ fieldArrayName, assetIndex, peripherals }) {

    const [ curAssetOption, setCurAssetOption ] = useState(null)

    const { handleAssetSearch } = useFormModal()

    const [ suggestedOptions, setSuggestedOptions ] = useState()

	const { handleError } = useUI();

    const { values, setFieldValue } = useFormikContext();

    const [ warnings, setWarnings ] = useState({})

    useEffect(() => {
        const newPeripherals = {};
        values.users.forEach((user) => {
            user.assets.forEach((asset) => {
                asset.peripherals.forEach((peripheral) => {
                    if (peripheral.isNew && peripheral.id !== '') {
                        newPeripherals[peripheral.id] = (newPeripherals[peripheral.id] || 0) + parseInt(peripheral.count, 10);
                    }
                });
            });
        });
    
        setWarnings((prevWarnings) => {
            const updatedWarnings = { ...prevWarnings };
    
            values.users.forEach((user, userIndex) => {
                user.assets.forEach((asset, assetIndex) => {
                    asset.peripherals.forEach((peripheral, peripheralIndex) => {
                        if (newPeripherals[peripheral.id]) {
                            updatedWarnings[`users.${userIndex}.assets.${assetIndex}.peripherals.${peripheralIndex}.id`] =
                                `New peripheral will be created (${newPeripherals[peripheral.id]}x found in this form)`;
                        } else delete updatedWarnings[`users.${userIndex}.assets.${assetIndex}.peripherals.${peripheralIndex}.id`]
                    });
                });
            });
    
            return updatedWarnings;
        });
    }, [values, setWarnings]);

    useEffect(() => {
        if (!curAssetOption?.value) return;
		const fetchItems = async () => {
		  try {
			const response = await peripheralService.getSuggestedPeripherals(curAssetOption.value);
			const suggestedOptions = response.data;
            console.log(suggestedOptions);  
			setSuggestedOptions(suggestedOptions);
		  } catch (err) {
			handleError(err);
			console.error(err);
		  }
		};
	
		fetchItems();
	}, [curAssetOption, handleError, setFieldValue, assetIndex, fieldArrayName]);

    return (
        <>
            <SearchFormControl
                name={`${fieldArrayName}.${assetIndex}.assetId`} 
                searchFn={handleAssetSearch}
                callback={(newOption) => {
                    if (curAssetOption && newOption && newOption.value === curAssetOption.value) return;
                    setCurAssetOption(newOption);
                }}
                label={`Asset Tag #${assetIndex + 1}`}
                placeholder="Asset Tag"
            />
            
            <FieldArray name={`${fieldArrayName}.${assetIndex}.peripherals`}>
                {peripheralHelpers => (
                    <Box>
                        <HStack>
                            {suggestedOptions && suggestedOptions.length > 0 && (
                                suggestedOptions.map((option) => (
                                    <Button onClick={() => peripheralHelpers.push(createNewPeripheral(option.id))}/>
                                ))
                            )}
                        </HStack>
                        {peripherals && peripherals.length > 0 && peripherals.map((peripheral, index, array) => {
                            const fieldName = `${fieldArrayName}.${assetIndex}.peripherals.${index}`
                            return (
                                <Flex key={peripheral.key} gap={4} alignItems="flex-start">
                                    <SearchFormControl
                                        name={`${fieldName}.id`}
                                        defaultOptions={suggestedOptions}
                                        callback={(newOption) => {
                                            if (newOption?.__isNew__) setFieldValue(`${fieldArrayName}.${assetIndex}.peripherals.${index}.isNew`, true)
                                        }}
                                        warning={warnings[`${fieldName}.id`]}
                                    />
                                    <InputFormControl
                                        name={`${fieldArrayName}.${assetIndex}.peripherals.${index}.count`} 
                                        type="number" 
                                        placeholder="Enter count" 
                                    />
                                    <IconButton
                                        onClick={() => peripheralHelpers.remove(index)}
                                        icon={<MdRemoveCircleOutline />}
                                        aria-label="Remove Peripheral"
                                    />
                                </Flex>
                            )
                        })}
                        <Flex alignSelf="flex-end" gap={2} marginBottom={4}>
                            <Button mt={4} type="button" onClick={() => {
                                    console.log('Before push:', values);
                                    peripheralHelpers.push(createNewPeripheral());
                                    console.log('After push:', values);
                                }}>
                                <ResponsiveText>Add Peripheral</ResponsiveText>
                            </Button>
                        </Flex>
                    </Box>
                )}
            </FieldArray>
        </>
    )
}