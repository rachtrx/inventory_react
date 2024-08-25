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
import { v4 as uuidv4, validate as isUuidValid } from 'uuid';
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
})

export const LoanAsset = function({ fieldArrayName, assetIndex, asset, assetHelpers }) {

	// console.log('loan asset');

	const { handleAssetSearch, handlePeripheralSearch } = useFormModal()
	const [ suggestedOptions, setSuggestedOptions ] = useState()
	const { values, setFieldValue } = useFormikContext();
	const { handleError } = useUI();
	const { mode, setMode, warnings, loan } = useLoan();
	// console.log(warnings);

	useEffect(() => {
		if (!asset.assetId || !isUuidValid(asset.assetId)) return;
		const fetchItems = async () => {
			try {
			const response = await peripheralService.getSuggestedPeripherals(asset.assetId);
			const suggestedOptions = response.data;
				console.log(suggestedOptions);  
				setSuggestedOptions(suggestedOptions);
			} catch (err) {
				handleError(err);
				console.error(err);
			}
		};
	
		fetchItems();
	}, [asset, handleError, setFieldValue, assetIndex, fieldArrayName]);

	return (
		<>
			<Flex key={assetIndex} gap={4} alignItems={'flex-start'}>
				<SearchSingleSelectFormControl
					name={`${fieldArrayName}.${assetIndex}.assetId`}
					searchFn={value => handleAssetSearch(value, mode)}
					secondaryFieldsMeta={[
						{name: `${fieldArrayName}.${assetIndex}.assetTag`, attr: 'assetTag'},
						{name: `${fieldArrayName}.${assetIndex}.shared`, attr: 'shared'}
					]}
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
			{asset && asset.assetTag && 
					<InputFormControl name={`${fieldArrayName}.${assetIndex}.remarks`} label={`Add remarks for ${asset.assetTag}`}/>
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
						{asset.peripherals && asset.peripherals.length > 0 && asset.peripherals.map((peripheral, index, array) => {
							const fieldName = `${fieldArrayName}.${assetIndex}.peripherals.${index}`
							// console.log(fieldName);
							return (
								<Box key={peripheral.key}>
									<SearchCreatableSingleSelectFormControl
										name={`${fieldName}.id`}
										defaultOptions={suggestedOptions}
										searchFn={handlePeripheralSearch}
										warning={warnings?.assets?.[assetIndex]?.peripherals?.[index]?.id || null}
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
						{(asset.assetId || asset.peripherals) && (
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
					</Box>
				)}
			</FieldArray>
		</>
	)
}