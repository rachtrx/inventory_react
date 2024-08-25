import { useEffect, useState } from "react"
import { SearchCreatableSingleSelectFormControl, SearchSingleSelectFormControl } from "./utils/SelectFormControl"
import { useFormModal } from "../../context/ModalProvider"
import { useUI } from "../../context/UIProvider"
import peripheralService from "../../services/PeripheralService"
import { Button, Flex, VStack, IconButton, Box, Popover, PopoverTrigger, PopoverContent, PopoverArrow, PopoverCloseButton, PopoverBody, HStack, CloseButton } from "@chakra-ui/react";
import { MdRemoveCircleOutline, MdSave } from 'react-icons/md';
import { FieldArray } from "formik"
import InputFormControl from "./utils/InputFormControl"
import { ResponsiveText } from "../utils/ResponsiveText"
import { useFormikContext } from 'formik';
import { v4 as uuidv4 } from 'uuid';
import { warning } from "framer-motion"
import FormToggle from "./utils/FormToggle"
import { AddIcon } from "@chakra-ui/icons"
import { AddButton, RemoveButton } from "./utils/ItemButtons"
import { useLoan } from "../../context/LoanProvider"
import { LoanType } from "./Loan"

export const createNewPeripheral = (id='') => ({
	'key': uuidv4(),
	'id': id,
	'count': 1, 
	'isNew': true // for warnings
})

export const LoanAsset = function({ fieldArrayName, assetIndex, asset, assetHelpers }) {

	// console.log('loan asset');

	const [ curAssetOption, setCurAssetOption ] = useState({})
	const { handleAssetSearch, handlePeripheralSearch } = useFormModal()
	const [ suggestedOptions, setSuggestedOptions ] = useState()
	const { values, setFieldValue } = useFormikContext();
	const { handleError } = useUI();
	const { mode, setMode, warnings, loan } = useLoan();

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
			<Flex key={assetIndex} gap={4} alignItems={'flex-start'}>
				<SearchSingleSelectFormControl
					name={`${fieldArrayName}.${assetIndex}.assetId`}
					searchFn={value => handleAssetSearch(value, mode)}
					callback={(newOption) => {
						console.log(newOption);

						if(!newOption) {
							setCurAssetOption({});
							return;    
						}
						if (newOption.value === curAssetOption.value) return;
						setCurAssetOption(newOption);
						setMode(newOption.shared ? LoanType.SHARED : LoanType.SINGLE);
					}}
					label={`Asset Tag #${assetIndex + 1}`}
					placeholder="Asset Tag"
				>
					<RemoveButton
						ariaLabel="Remove Asset"
						onClick={() => assetHelpers.remove(assetIndex)}
						isDisabled={loan.assets.length === 1}
					/>
				</SearchSingleSelectFormControl>
			</Flex>
			{curAssetOption && curAssetOption.assetTag && 
					<InputFormControl name={`${fieldArrayName}.${assetIndex}.remarks`} label={`Add remarks for ${curAssetOption.assetTag}`}/>
			}
			
			<FieldArray name={`${fieldArrayName}.${assetIndex}.peripherals`}>
				{peripheralHelpers => (
					<Box>
						<HStack mb={1}>
							{suggestedOptions && suggestedOptions.length > 0 && (
								suggestedOptions.map((option) => (
									<Button onClick={() => peripheralHelpers.push(createNewPeripheral(option.id))}/>
								))
							)}
						</HStack>
						{(curAssetOption.assetId || asset.peripherals) && (
							<AddButton
								ariaLabel="Add Peripheral"
								handleClick={() => {
									console.log('Before push:', values);
									peripheralHelpers.push(createNewPeripheral());
									console.log('After push:', values);
								}}
								label={`Add peripheral`}
								size='xs'
							/>
						)}
						{asset.peripherals && asset.peripherals.length > 0 && asset.peripherals.map((peripheral, index, array) => {
							const fieldName = `${fieldArrayName}.${assetIndex}.peripherals.${index}`
							// console.log(fieldName);
							return (
								<Box key={peripheral.key}>
									<SearchCreatableSingleSelectFormControl
										name={`${fieldName}.id`}
										defaultOptions={suggestedOptions}
										searchFn={handlePeripheralSearch}
										callback={(newOption) => {
											if (newOption?.__isNew__) setFieldValue(`${fieldArrayName}.${assetIndex}.peripherals.${index}.isNew`, true)
										}}
										warning={warnings?.[`${fieldName}.id`]}
									>
										<InputFormControl
											name={`${fieldArrayName}.${assetIndex}.peripherals.${index}.count`} 
											type="number" 
											placeholder="Enter count" 
										/>
										<RemoveButton
											ariaLabel="Remove Peripheral"
											handleClick={() => peripheralHelpers.remove(index)}
										/>
									</SearchCreatableSingleSelectFormControl>
								</Box>
							)
						})}
					</Box>
				)}
			</FieldArray>
		</>
	)
}