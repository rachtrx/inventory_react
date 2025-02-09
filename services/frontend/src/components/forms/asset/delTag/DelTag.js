import { useEffect, useState } from "react"
import InputFormControl from "../../utils/InputFormControl"
import { FieldArray, useFormikContext } from 'formik';
import { CreatableSingleSelectFormControl, SearchSingleSelectFormControl, SingleSelectFormControl } from "../../utils/SelectFormControl";
import { Box, Divider, Flex } from "@chakra-ui/react";
import DateInputControl from "../../utils/DateInputControl";
import { useFormModal } from "../../../../context/ModalProvider";
import { LoanAstSelectFormControl } from "../loan/CustomSelect";
import assetService from "../../../../services/AssetService";
import { createNewAsset, useAssetTags } from "../addTag/AssetTagsProvider";
import { AddButton, RemoveButton } from "../../utils/ItemButtons";

export const DelTag = function({ tag, tagIndex, children }) {

	const { tagOptions, assetOptions } = useAssetTags();
	const { setFieldValue } = useFormikContext();

	const updateAssetFields = (assetIndex, selected) => {

		if (!selected?.value) {
			setFieldValue(`tags.${tagIndex}.assets.${assetIndex}.assetId`, '');
			setFieldValue(`tags.${tagIndex}.assets.${assetIndex}.assetTagId`, '');
            return;
		}
		
        console.log(selected);
        setFieldValue(`tags.${tagIndex}.assets.${assetIndex}.assetId`, selected?.assetId || '');
		setFieldValue(`tags.${tagIndex}.assets.${assetIndex}.assetTagId`, selected.tags?.find(tag => tag.isMatching)?.assetTagId || '');
    }

    const updateTagFields = (selected, tagIndex) => {

		if (!selected?.value) {
			setFieldValue(`tags.${tagIndex}.assets`, []);
            return;
		}

        console.log(selected);
		setFieldValue(`tags.${tagIndex}.assets`, [createNewAsset()]);
        setFieldValue(`tags.${tagIndex}.tagId`, selected?.tagId || '');
    }

	return (
		<>
            <Box position='relative'>
                <Flex direction="column" gap={2}>
                    <SingleSelectFormControl
                        name={`tags.${tagIndex}.tagName`}
                        label={`Tag`}
                        placeholder="Select Tag"
                        updateFields={(selected) => updateTagFields(selected, tagIndex)}
                        initialOptions={tagOptions}
                    />
                    <Divider borderColor="black" borderWidth="0.5px" my={4} />
                    <FieldArray name={`tags.${tagIndex}.assets`}>
                        {assetHelpers => (
                            tag.assets.map((asset, assetIndex, assetArray) => (
                                <Flex direction="column" gap={2} key={asset.key}>
                                    <Flex key={asset.key} alignItems="center"gap={2}>
                                        <LoanAstSelectFormControl
                                            name={`tags.${tagIndex}.assets.${assetIndex}.serialNumber`}
                                            searchFn={value => assetService.fetchUntagAsset(value, tag.tagId)} // TODO handle shareds
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
	)
}