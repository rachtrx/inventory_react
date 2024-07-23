import { Box, Button } from "@chakra-ui/react"
import { CustomMultiSelectFormControl, SingleSelectFormControl } from "./utils/SelectFormControl"
import { updateOptions, useFormModal } from "../../context/ModalProvider"
import FormToggle from "./utils/FormToggle"
import InputFormControl from "./utils/InputFormControl"
import { useCallback, useState } from "react"

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
			{user.assets.map((_, assetIndex) => (
				<Box key={assetIndex}>
					<SingleSelectFormControl 
						name={`users.${userIndex}.assets.${assetIndex}.asset-id`} 
						onInputChange={handleAssetInputChange}
						updateChangeFn={updateChangeFn}
						label="Asset Tag" 
						options={assets} 
						placeholder="Asset Tag"
					/>
					<FormToggle label="Bookmark Asset" name={`users.${userIndex}.assets.${assetIndex}.bookmarked`}/>
					<CustomMultiSelectFormControl 
						name={`users.${userIndex}.assets.${assetIndex}.tags`} 
						label="Add Tags" 
						options={options.tags[assetType]}
						updateChangeFn={(tagsForAssetType) => updateOptions(setOptions, 'tags', assetType, tagsForAssetType)}
						placeholder="Select tags"
					/>
					<InputFormControl name={`users.${userIndex}.assets.${assetIndex}.remarks`} label="Remarks" placeholder="Add remarks" />
					{user.assets.length > 1 && (
						<Button type="button" onClick={() => assetHelpers.remove(assetIndex)} style={{ marginTop: '10px' }}>
						Remove Asset
						</Button>
					)}
				</Box>
			))}
			<Button
				type="button"
				onClick={() => assetHelpers.push({
				'asset-id': '',
				'bookmarked': false,
				'tags': []
				})}
				style={{ marginTop: '10px' }}
			>
				Add Asset
			</Button>
		</Box>
	)
}