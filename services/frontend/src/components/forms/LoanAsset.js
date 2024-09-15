import { useEffect, useState } from "react"
import { SearchCreatableSingleSelectFormControl, SearchSingleSelectFormControl } from "./utils/SelectFormControl"
import { useFormModal } from "../../context/ModalProvider"
import { useUI } from "../../context/UIProvider"
import peripheralService from "../../services/PeripheralService"
import { Button, Flex, VStack, IconButton, Box, Popover, PopoverTrigger, PopoverContent, PopoverArrow, PopoverCloseButton, PopoverBody, HStack, CloseButton } from "@chakra-ui/react";
import { FieldArray } from "formik"
import InputFormControl from "./utils/InputFormControl"
import { ResponsiveText } from "../utils/ResponsiveText"
import { useFormikContext } from 'formik';
import { AddButton, RemoveButton } from "./utils/ItemButtons"
import { useLoan } from "../../context/LoanProvider"
import DateInputControl from "./utils/DateInputControl"
import { v4 as uuidv4, validate as isValidUuid } from 'uuid';

export const createNewPeripheral = (id='') => ({
	'key': uuidv4(),
	'id': id,
	'count': 1, 
})

export const LoanAsset = function({ loanIndex, asset }) {

	// console.log('loan asset');

	const { handleAssetSearch, handlePeripheralSearch } = useFormModal()
	const [ suggestedOptions, setSuggestedOptions ] = useState()
	const { values, setFieldValue } = useFormikContext();
	const { handleError } = useUI();
	const { mode, setMode, warnings } = useLoan();
	// console.log(warnings);

	useEffect(() => {
		if (!asset.assetId || !isValidUuid(asset.assetId)) return;
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
	}, [asset, handleError, setFieldValue]);

	return (
		<>
			<Flex gap={4} alignItems={'flex-start'}>
				<SearchSingleSelectFormControl
					name={`loans.${loanIndex}.asset.assetId`}
					searchFn={value => handleAssetSearch(value, mode)}
					secondaryFieldsMeta={[
						{name: `loans.${loanIndex}.asset.assetTag`, attr: 'assetTag'},
						{name: `loans.${loanIndex}.asset.shared`, attr: 'shared'}
					]}
					label={`Asset Tag`}
					placeholder="Asset Tag"
				/>
			</Flex>
			{asset && asset.assetTag && 
				<InputFormControl name={`loans.${loanIndex}.asset.remarks`} label={`Loan Remarks for ${asset.assetTag}`}/>
			}
			
			<FieldArray name={`loans.${loanIndex}.asset.peripherals`}>
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
							const fieldName = `loans.${loanIndex}.asset.peripherals.${index}`
							// console.log(fieldName);
							return (
								<Box key={peripheral.key}>
									<SearchCreatableSingleSelectFormControl
										name={`${fieldName}.id`}
										defaultOptions={suggestedOptions}
										searchFn={handlePeripheralSearch}
										warning={warnings?.loans?.[loanIndex]?.peripherals?.[index]?.id || null}
									>
										<InputFormControl
											name={`${fieldName}.count`} 
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
			<Flex mt={2}>
				<DateInputControl label="Loaned Date" name={`loans.${loanIndex}.asset.loanDate`} />
				<DateInputControl label="Expected Return Date" name={`loans.${loanIndex}.asset.expectedReturnDate`} />
			</Flex>
		</>
	)
}