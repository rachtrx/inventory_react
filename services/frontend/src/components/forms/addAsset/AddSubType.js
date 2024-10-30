import { Box, Button, Divider, Flex, IconButton, Spacer, Tooltip, VStack } from "@chakra-ui/react"
import { FieldArray, useFormikContext } from "formik"
import { ResponsiveText } from "../../utils/ResponsiveText"
import React, { useEffect, useState } from "react"
import { AddButton, RemoveButton } from "../utils/ItemButtons"
import { useLoan } from "./TypeProvider"
import { FaUser, FaUsers } from "react-icons/fa"
import { AddAsset, LoanAsset } from "./AddAsset";
import { CreatableSingleSelectFormControl, SearchSingleSelectFormControl } from "../utils/SelectFormControl"
import { useFormModal } from "../../../context/ModalProvider"
import DateInputControl from "../utils/DateInputControl"
import { createNewAsset, createNewSubType, useLoans } from "./AddAssetsProvider"
import { Outlet } from "react-router-dom"
import assetService from "../../../services/AssetService"

export const AddSubType = ({
	field,
	subType,
	subTypeOptions,
	children
}) => {

	const { values, setFieldValue } = useFormikContext();

	const [ cost, setCost] = useState(0);

	useEffect(() => {
		if (subType.subTypeId === "" || cost !== 0) return;

		const getCostForSubType = async () => {
			const response = await assetService.getLatestSubTypeCost(subType.subTypeId);
			return response.data;
		}
		
		setCost(getCostForSubType()); // only set first time
	}, [subType.subTypeId, cost])

	return (
		<Box position='relative'>
			<CreatableSingleSelectFormControl
				name={`${field}.subTypeName`}
				placeholder="Select Sub Type"
				updateFields={(selected) => setFieldValue(`${field}.subTypeId`, selected?.subTypeName || '')}
				initialOptions={subTypeOptions}
			/>
			<FieldArray name={`${field}.assets`}>
				{assetHelpers => (
					subType.assets.map((asset, assetIndex, assetArray) => (
						<AddAsset
							key={asset.key}
							field={`${field}.assets.${assetIndex}`}
							asset={asset}
							cost={cost}
							setCost={setCost}
						>
							{/* chilften are the helper functions */}
							<Flex mt={2} gap={4} justifyContent="space-between">
								{values.loans.length > 1 && (
									<Button
										type="button"
										onClick={() => assetHelpers.remove(assetIndex)}
										alignSelf="flex-start"
										colorScheme="red"
									>
									<ResponsiveText>Remove</ResponsiveText>
									</Button>
								)}
							</Flex>
							<Divider borderColor="black" borderWidth="2px" my={4} />
							{assetIndex === assetArray.length - 1 && (
								<AddButton
									handleClick={() => assetHelpers.push(createNewAsset({cost}))}
									label="Add Asset"
								/>
							)};
						</AddAsset>
					))
				)}
			</FieldArray>
			{/* Include the helper functions */}
			{children} 
		</Box>
	)
}
