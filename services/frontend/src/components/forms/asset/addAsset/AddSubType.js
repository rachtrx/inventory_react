import { Box, Button, Divider, Flex, Grid, Text } from "@chakra-ui/react"
import { FieldArray, useFormikContext } from "formik"
import { useEffect, useState } from "react"
import { AddButton } from "../../utils/ItemButtons"
import { AddAsset } from "./AddAsset";
import { CreatableSingleSelectFormControl } from "../../utils/SelectFormControl"
import { useAddAssets } from "./AddAssetsProvider"
import WarningCard from "../../utils/WarningCard"
import { createNewAsset } from "./helpers"

export const AddSubType = ({
	field,
	typeId,
	subType,
	subTypeOptions,
	children
}) => {

	const { setFieldValue } = useFormikContext();
	const { addNewSubType } = useAddAssets()
	const [ cost, setCost ] = useState(0);

	useEffect(() => {
		console.log(subTypeOptions);
		if (!subType.subTypeName || subType.subTypeId) return;
		const matchedOption = subTypeOptions.find(option => option.subTypeId && option.value === subType.subTypeName);
		if(matchedOption) setFieldValue(`${field}.subTypeId`, matchedOption.subTypeId);
	}, [subTypeOptions, setFieldValue, subType, field]);

	useEffect(() => {
		if (subType.subTypeId === "" || cost !== 0) return;

		// TODO
		// const getDefaultCostForSubType = async () => {
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
				<Flex direction="column">
					<CreatableSingleSelectFormControl
						label={`Sub Type`}
						name={`${field}.subTypeName`}
						placeholder="Select Sub Type"
						updateFields={handleSubTypeUpdate}
						initialOptions={subTypeOptions}
					/>
					{typeId && subType.subTypeName && !subType.subTypeId && 
						<WarningCard
							message={`Create ${subType.subTypeName}?`}
							items={subTypeOptions}
							itemAttr="value"
							onCreate={() => addNewSubType(subType.subTypeName, typeId)}
						/>
					}
				</Flex>
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
												colorScheme="red"
											>
											<Text>Remove Asset</Text>
											</Button>
										)}
									</Flex>
									<Divider borderColor="black" borderWidth="2px" my={4} />
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
