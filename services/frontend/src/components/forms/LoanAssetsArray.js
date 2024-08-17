import { Box, Button, Flex } from "@chakra-ui/react"
import FormToggle from "./utils/FormToggle"
import InputFormControl from "./utils/InputFormControl"
import { ResponsiveText } from "../utils/ResponsiveText"
import { FieldArray, useFormikContext } from "formik"
import { LoanAssetPeripherals } from "./LoanAssetPeripherals"
import { v4 as uuidv4 } from 'uuid';

export const createNewAsset = (assetId='') => ({
	'key': uuidv4(),
    'assetId': assetId,
    'bookmarked': false,
    'tags': [],
    'remarks': '',
	// 'shared': false,
	// 'sharedUserIds': []
    'peripherals': []
})

export const LoanAssetsArray = ({fieldArrayName, assets}) => {

	console.log(assets);

	return (
		<FieldArray name={fieldArrayName}>
			{assetHelpers => assets.map((asset, assetIndex, array) => (
				<Flex direction="column" key={asset.key} gap={4} p={2} _hover={{ bg: "blue.50" }}>
					<LoanAssetPeripherals
						fieldArrayName={fieldArrayName}
						assetIndex={assetIndex}
						peripherals={assets[assetIndex].peripherals}
					/>
					<InputFormControl name={`${fieldArrayName}.${assetIndex}.remarks`} label="Remarks" placeholder="Add remarks" />
					<FormToggle label="Bookmark Asset" name={`${fieldArrayName}.${assetIndex}.bookmarked`}/>
					<Flex justifyContent="flex-start" gap={2} marginBottom={4}>
						{assets.length > 1 && (
							<Button type="button" onClick={() => {
								console.log(`Asset Index: ${assetIndex}`);
								assetHelpers.remove(assetIndex);
							}}>
								<ResponsiveText>Remove Asset</ResponsiveText>
							</Button>
						)}
						{assetIndex === array.length - 1 && (
							<Button
								type="button"
								onClick={() => assetHelpers.push(createNewAsset())}
							>
								<ResponsiveText>Add Asset</ResponsiveText>
							</Button>
						)}
					</Flex>
				</Flex>
			))}
		</FieldArray>
	)
}