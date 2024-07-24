import { Box, Button, Flex } from "@chakra-ui/react"
import { CustomMultiSelectFormControl, SingleSelectFormControl } from "./utils/SelectFormControl"
import { updateOptions, useFormModal } from "../../context/ModalProvider"
import FormToggle from "./utils/FormToggle"
import InputFormControl from "./utils/InputFormControl"
import { useCallback, useState } from "react"
import { ResponsiveText } from "../utils/ResponsiveText"

export const LoanSingleAsset = ({user, assetHelpers, userIndex, options, setOptions}) => {

	const {assets, handleAssetInputChange} = useFormModal()

	const [ assetType, setAssetType ] = useState()

	const updateChangeFn = useCallback((value) => {
		console.log(value);
		if (value && value.assetType) {
				setAssetType(value.assetType);
		}
	}, [setAssetType]);

	return (
		<Box>
			{user.assets.map((_, assetIndex, array) => (
				<Flex direction="column" key={assetIndex} gap={4} p={2} _hover={{ bg: "blue.50" }}>
					<SingleSelectFormControl 
						name={`users.${userIndex}.assets.${assetIndex}.asset-id`} 
						onInputChange={handleAssetInputChange}
						updateChangeFn={updateChangeFn}
						label={`Asset Tag #${assetIndex + 1}`}
						options={assets} 
						placeholder="Asset Tag"
					/>
					<CustomMultiSelectFormControl 
						name={`users.${userIndex}.assets.${assetIndex}.tags`} 
						label="Add Tags" 
						options={options.tags[assetType]}
						updateChangeFn={(tagsForAssetType) => updateOptions(setOptions, 'tags', assetType, tagsForAssetType)}
						placeholder="Select tags"
					/>
					<InputFormControl name={`users.${userIndex}.assets.${assetIndex}.remarks`} label="Remarks" placeholder="Add remarks" />
					<FormToggle label="Bookmark Asset" name={`users.${userIndex}.assets.${assetIndex}.bookmarked`}/>
					<Flex justifyContent="flex-start" gap={2} marginBottom={4}>
						{user.assets.length > 1 && (
							<Button type="button" onClick={() => assetHelpers.remove(assetIndex)}>
								<ResponsiveText>Remove Asset</ResponsiveText>
							</Button>
						)}
						{assetIndex === array.length - 1 && (
							<Button
								type="button"
								onClick={() => assetHelpers.push({
								'asset-id': '',
								'bookmarked': false,
								'tags': []
								})}
							>
								<ResponsiveText>Add Asset</ResponsiveText>
							</Button>
						)}
					</Flex>
				</Flex>
			))}
		</Box>
	)
}