import { useEffect } from "react"
import { Flex, Box, FormControl, FormErrorMessage, Card, SimpleGrid, CardHeader, CardBody, CardFooter, Button, Stack, StackDivider, Text } from "@chakra-ui/react";
import { FieldArray } from "formik"
import InputFormControl from "../utils/InputFormControl"
import { useFormikContext } from 'formik';
import { AddButton } from "../utils/ItemButtons"
import { createNewAccessory, createNewAsset } from "./helpers"
import DateInputControl from "../utils/DateInputControl"
import LoanAccessory from "./LoanAccessory"
import { LoanAsset } from "./LoanAsset";
import get from 'lodash/get';
import { SuggestedAccessories } from "./SuggestedAccessories";
import RemarksFormControl from "../utils/RemarksFormControl";

export const LoanItems = function({ field, loan, children }) {
	
	const { setFieldValue, errors, touched, setTouched } = useFormikContext();

	const errorMessage = get(errors, `${field}.valid`);
	const isTouched = get(touched, `${field}.valid`);
	const isInvalid = !!errorMessage && isTouched;

	const handleClearAsset = () => {
		setFieldValue(`${field}.asset`, null);
	}

	const handleClearAccessories = () => {
		setFieldValue(`${field}.accessories`, []);
	}

	useEffect(() => {
		if ((get(touched, `${field}.asset.serialNumber`) || get(touched, `${field}.accessories.0.accessoryName`)) && !loan.asset && !loan.accessories?.length) {
			setFieldValue(`${field}.valid`, false);
		} else if (!loan.valid) setFieldValue(`${field}.valid`, true);
	}, [loan, field, setFieldValue, touched])

	useEffect(() => {
		if (get(touched, `${field}.valid`)) return;

		if (get(touched, `${field}.asset.serialNumber`) || get(touched, `${field}.accessories.0.accessoryName`)) {
			setTouched({ [`${field}.valid`]: true });
		}
		console.log(touched);
	}, [field, touched, setTouched])

	return (
		<>
			<Flex direction="column" gap={1}>
				{/* SECTION ASSET  */}
				<FormControl isInvalid={isInvalid}>
					<SimpleGrid 
						spacing={2}
						templateColumns='repeat(auto-fill, minmax(200px, 1fr))'
					>
						<Card size="sm" border={isInvalid ? '1px solid red' : undefined} borderRadius="md">
							<CardHeader>
								<Text fontSize='sm' fontWeight="bold">Asset</Text>
							</CardHeader>
							<CardBody>
								{loan.asset ? 
								<LoanAsset
									field={`${field}.asset`}
									asset={loan.asset}
								/> : 
								<AddButton
									ariaLabel="Add Asset"
									handleClick={() => {
										setFieldValue(`${field}.asset`, createNewAsset());
									}}
									label={`Add Asset`}
									size='xs'
								/>}
							</CardBody>
							<CardFooter>
								<Button 
									onClick={handleClearAsset}
									isDisabled={!loan.asset}
								>Clear</Button>
							</CardFooter>
						</Card>
						<Card size="sm" border={isInvalid ? '1px solid red' : undefined} borderRadius="md">
							<CardHeader>
								<Text fontSize='sm' fontWeight="bold">Accessories</Text>
							</CardHeader>
							<CardBody>
								<FieldArray name={`${field}.accessories`}>
									{accessoryHelpers => (
										<Box>
											{!loan.accessories.length && loan.asset?.sTypeId && 
												<SuggestedAccessories 
													sTypeId={loan.asset.sTypeId}
													accessoryHelpers={accessoryHelpers}
												/>}
											<Stack divider={<StackDivider />}>
												{loan.accessories.map((accessory, accessoryIndex) => 
													(<LoanAccessory
														key={accessory?.key}
														accessory={accessory}
														field={`${field}.accessories.${accessoryIndex}`}
														index={accessoryIndex}
														helpers={accessoryHelpers}
														autoFocus={accessoryIndex === loan.accessories.length - 1}
													/>)
												)}
											</Stack>
											<AddButton
												ariaLabel="Add Accessory"
												handleClick={() => {
													accessoryHelpers.push(createNewAccessory());
												}}
												label={`Add Accessory`}
												size='xs'
											/>
										</Box>
									)}
								</FieldArray>
							</CardBody>
							<CardFooter>
								<Button 
									onClick={handleClearAccessories}
									isDisabled={!loan.accessories?.length}
								>Clear</Button>
							</CardFooter>
						</Card>
					</SimpleGrid>
					<FormErrorMessage>{errorMessage}</FormErrorMessage>
					</FormControl>
				
				<DateInputControl label="Expected Return Date" name={`${field}.expectedReturnDate`} />
				<RemarksFormControl name={`${field}.remarks`} label={`Loan Remarks`}/>
				{children}
			</Flex>
		</>
	)
}