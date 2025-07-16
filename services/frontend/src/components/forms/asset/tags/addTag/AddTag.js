import { Box, Button, Divider, Flex, IconButton, Spacer, Tooltip, VStack } from "@chakra-ui/react"
import { FieldArray, useFormikContext } from "formik"
import { ResponsiveText } from "../../../../utils/ResponsiveText"
import React, { useEffect, useState } from "react"
import { AddButton, RemoveButton } from "../../../utils/ItemButtons"
import { CreatableSingleSelectFormControl } from "../../../utils/SelectFormControl"
import { createNewAsset, useAssetTags } from "../AssetTagsProvider"
import assetService from "../../../../../services/AssetService"
import { LoanAstSelectFormControl } from "../../../loan/CustomSelect"
import InputFormControl from "../../../utils/InputFormControl"
import WarningCard from "../../../utils/Warnings"

export const AddTag = ({tag, tagIndex, children}) => {

    const { tagOptions, assetOptions, addNewTag } = useAssetTags();
	const { setFieldValue } = useFormikContext();

    useEffect(() => {
        console.log(tagOptions);
        if (!tag.tagName || tag.tagId) return;
        const matchedOption = tagOptions.find(option => option.tagId && option.value === tag.tagName);
        if(matchedOption) setFieldValue(`tags.${tagIndex}.tagId`, matchedOption.tagId);
    }, [tagOptions, setFieldValue, tag, tagIndex]);

    const updateAssetFields = (assetIndex, selected) => {

		if (!selected?.value) {
			setFieldValue(`tags.${tagIndex}.assets.${assetIndex}.assetId`, '');
			setFieldValue(`tags.${tagIndex}.assets.${assetIndex}.assetTagId`, '');
            return;
		}
		
        // console.log(selected);
        setFieldValue(`tags.${tagIndex}.assets.${assetIndex}.assetId`, selected?.assetId || '');
		setFieldValue(`tags.${tagIndex}.assets.${assetIndex}.assetTagId`, selected.tags?.find(tag => tag.isMatching)?.assetTagId || '');
    }

    const updateTagFields = (selected, tagIndex) => {

        // console.log(selected);

        if (!selected?.value) {
			setFieldValue(`tags.${tagIndex}.assets`, []);
            return;
		}
        
        setFieldValue(`tags.${tagIndex}.assets`, [createNewAsset()]);
        setFieldValue(`tags.${tagIndex}.tagId`, selected?.tagId || '');
    }

	return (
        <>
            <Box position='relative'>
                <Flex direction="column" gap={2}>
                    <CreatableSingleSelectFormControl
                        name={`tags.${tagIndex}.tagName`}
                        label={`Tag`}
                        placeholder="Select Tag"
                        updateFields={(selected) => updateTagFields(selected, tagIndex)}
                        initialOptions={tagOptions}
                    />
                    {tag.tagName && !tag.tagId && 
                        <WarningCard
                            message={`Create ${tag.tagName}?`}
                            items={tagOptions}
                            itemAttr="value"
                            onCreate={() => addNewTag(tag.tagName)}
                        />
                    }
                    <Divider borderColor="black" borderWidth="0.5px" my={4} />
                    <FieldArray name={`tags.${tagIndex}.assets`}>
                        {assetHelpers => (
                            tag.assets.map((asset, assetIndex, assetArray) => (
                                <Flex direction="column" gap={2} key={asset.key}>
                                    <Flex key={asset.key} alignItems="center"gap={2}>
                                        <LoanAstSelectFormControl
                                            name={`tags.${tagIndex}.assets.${assetIndex}.serialNumber`}
                                            searchFn={value => assetService.fetchTagAsset(value, tag.tagId)} // TODO handle shareds
                                            updateFields={(selected) => updateAssetFields(assetIndex, selected)}
                                            placeholder="Serial Number"
                                            initialOptions={assetOptions?.[tag.tagName] || []}
                                        />
                                        <RemoveButton
                                            ariaLabel="Remove Asset"
                                            handleClick={() => assetHelpers.remove(assetIndex)}
                                        />
                                    </Flex>
                                    <InputFormControl name={`tags.${tagIndex}.assets.${assetIndex}.remarks`} label={`Tag Remarks`}/>
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
