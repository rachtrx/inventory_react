import { Box, Divider, Flex } from "@chakra-ui/react"
import { FieldArray, useFormikContext } from "formik"
import { useCallback, useEffect, useRef, useState } from "react"
import { AddButton, RemoveButton } from "../../../utils/ItemButtons"
import { CreatableSingleSelectFormControl } from "../../../utils/SelectFormControl"
import { useAssetTags } from "../AssetTagsProvider"
import assetService from "../../../../../services/AssetService"
import { AvailAstSelectFormControl } from "../../../options/AvailAssetOptions"
import { createNewAsset } from "../helpers"
import RemarksFormControl from "../../../utils/RemarksFormControl"

export const AddTag = ({tag, tagIndex, children}) => {

    const { tagOptions, setTagOptions, assetOptions, addNewTag } = useAssetTags();
	const { values, setFieldValue } = useFormikContext();

    useEffect(() => {
        console.log(values);
    }, [values]);

    const updateAssetFields = (assetIndex, selected) => {

		if (!selected?.value) {
			setFieldValue(`tags.${tagIndex}.assets.${assetIndex}.assetId`, '');
			setFieldValue(`tags.${tagIndex}.assets.${assetIndex}.tagIds`, []);
            return;
		}
		
        // console.log(selected);
        setFieldValue(`tags.${tagIndex}.assets.${assetIndex}.assetId`, selected?.assetId || '');
		setFieldValue(`tags.${tagIndex}.assets.${assetIndex}.tagIds`, selected?.tags?.map(tag => tag.tagId) || []);
    }

    const updateTagFields = (selected) => {
        setFieldValue(`tags.${tagIndex}.tagId`, selected?.tagId || '');
    };

	return (
        <>
            <Box position='relative'>
                <Flex direction="column" gap={2}>
                    <CreatableSingleSelectFormControl
                        name={`tags.${tagIndex}.tagName`}
                        label={`Tag`}
                        placeholder="Select Tag"
                        handleClick={updateTagFields}
                        options={tagOptions}
                        setOptions={setTagOptions}
                        onCreate={addNewTag}
                        trueKey="tagId"
                    />
                    <Divider borderColor="black" borderWidth="0.5px" my={4} />
                    <FieldArray name={`tags.${tagIndex}.assets`}>
                        {assetHelpers => (
                            tag.assets.map((asset, assetIndex, assetArray) => (
                                <Flex direction="column" gap={2} key={asset.key}>
                                    <Flex key={asset.key} alignItems="center"gap={2}>
                                        <AvailAstSelectFormControl
                                            name={`tags.${tagIndex}.assets.${assetIndex}.serialNumber`}
                                            searchFn={value => assetService.fetchTagAsset(value, tag.tagId)} // TODO handle shareds
                                            handleClick={(selected) => updateAssetFields(assetIndex, selected)}
                                            placeholder="Serial Number"
                                            options={assetOptions}
                                        />
                                        <RemoveButton
                                            ariaLabel="Remove Asset"
                                            handleClick={() => assetHelpers.remove(assetIndex)}
                                        />
                                    </Flex>
                                    <RemarksFormControl name={`tags.${tagIndex}.assets.${assetIndex}.remarks`} label={`Tag Remarks`}/>
                                    <Divider borderColor="black" borderWidth="0.5px" my={4} />
                                    {assetIndex === assetArray.length - 1 && (
                                        <AddButton
                                            handleClick={() => assetHelpers.push(createNewAsset())}
                                            label="Add Asset"
                                        />
                                    )}
                                </Flex>
                            ))
                        )}
                    </FieldArray>
                </Flex>
            </Box>
            {children}
        </>
	);
}
