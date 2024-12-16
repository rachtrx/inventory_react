import { Box, Button, Separator, Flex, Grid, IconButton, Spacer, Tooltip, VStack } from "@chakra-ui/react"
import { FieldArray, useFormikContext } from "formik"
import { ResponsiveText } from "../../utils/ResponsiveText"
import React, { useEffect, useState } from "react"
import { AddButton, RemoveButton } from "../utils/ItemButtons"
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

	const { setFieldValue } = useFormikContext();

	const [ cost, setCost ] = useState(0);

	console.log(field);

	useEffect(() => {
		if (subType.subTypeId === "" || cost !== 0) return;

		// TODO
		// const getCostForSubType = async () => {
		// 	const response = await assetService.getLatestSubTypeCost(subType.subTypeId);
		// 	return response.data;
		// }
		
		// setCost(getCostForSubType()); // only set first time
	}, [subType.subTypeId, cost])

	const handleSubTypeUpdate = async (selected) => {
		// IMPT dont update for new created sub Types
		if (!selected || selected?.subTypeId) {
			setFieldValue(`${field}.subTypeId`, selected?.subTypeId || '');
        	setFieldValue(`${field}.assets`, [createNewAsset()]);
		}
    };

	return (
		<Flex direction="column">
			<Grid position="relative" templateColumns="40% 60%" gap={2}>
				<CreatableSingleSelectFormControl
					label={`Sub Type`}
					name={`${field}.subTypeName`}
					placeholder="Select Sub Type"
					updateFields={handleSubTypeUpdate}
					initialOptions={subTypeOptions}
				/>
				<Box>
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
										{assetArray.length > 1 && (
											<Button
												type="button"
												onClick={() => assetHelpers.remove(assetIndex)}
												alignSelf="flex-start"
												colorPalette="red"
											>
											<ResponsiveText>Remove Asset</ResponsiveText>
											</Button>
										)}
									</Flex>
									<Separator borderColor="black" borderWidth="2px" my={4} />
									{assetIndex === assetArray.length - 1 && (
										<AddButton
											alignSelf="flex-start"
											handleClick={() => assetHelpers.push(createNewAsset({cost}))}
											label={`Add Asset${subType.subTypeName ? ` for ${subType.subTypeName}` : ''}`}
										/>
									)}
								</AddAsset>
							))
						)}
					</FieldArray>
				</Box>
			</Grid>
			{/* Include the helper functions */}
			{children}
		</Flex>
	)
}
