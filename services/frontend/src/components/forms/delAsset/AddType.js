import { Box, Button, Divider, Flex, IconButton, Spacer, Tooltip, VStack } from "@chakra-ui/react"
import { FieldArray, useFormikContext } from "formik"
import { ResponsiveText } from "../../utils/ResponsiveText"
import React, { useEffect, useState } from "react"
import { AddButton } from "../utils/ItemButtons"
import { CreatableSingleSelectFormControl } from "../utils/SelectFormControl"
import { createNewAsset, createNewSubType, createNewType, useAddAssets, useLoans } from "./DelAssetsProvider"
import { AddSubType } from "./AddSubType"
import assetService from "../../../services/AssetService"
import { AddAsset } from "./DelAsset"
import InputFormControl from "../utils/InputFormControl"

export const AddType = ({type, typeIndex, children}) => {

    const { typeOptions, subTypeOptionsDict, setSubTypeOptionsDict } = useAddAssets();
	const { setFieldValue } = useFormikContext();

    const handleTypeUpdate = async (selected) => {
        if (!selected || selected.typeId) { // IMPT dont update for new created types
            setFieldValue(`types.${typeIndex}.typeId`, selected?.typeId || '');
            setFieldValue(`types.${typeIndex}.subTypes`, [createNewSubType()]);

            if (!selected) return;

            const getSubTypeFilters = async (typeId) => {
                const response = await assetService.getSubTypeFilters([typeId]);
                return response.data;
            }
            const subTypeOptions = await getSubTypeFilters(selected.typeId);
            setSubTypeOptionsDict(oldDict => ({
                ...oldDict,
                [selected.typeId]: subTypeOptions[selected.typeId]
            }));
        } 
    };

	return (
        <>
            <Box position='relative'>
                <Flex direction="column" gap={2} key={type.key}>
                    <FieldArray name={`types.${typeIndex}.subTypes`}>
                        {subTypeHelpers => (
                            type.subTypes.map((subType, subTypeIndex, subTypeArray) => (
                                <AddSubType
                                    key={subType.key}
                                    field={`types.${typeIndex}.subTypes.${subTypeIndex}`}
                                    subType={subType}
                                    subTypeOptions={subTypeOptionsDict[type.typeId] || []}
                                >
                                    {/* chilften are the helper functions */}
                                    <Flex mt={2} gap={4} justifyContent="space-between">
                                        {subTypeArray.length > 1 && (
                                            <Button
                                                type="button"
                                                onClick={() => subTypeHelpers.remove(subTypeIndex)}
                                                alignSelf="flex-start"
                                                colorScheme="red"
                                            >
                                            <ResponsiveText>{`Remove ${subType.subTypeName ? ` ${subType.subTypeName}` : ''}`}</ResponsiveText>
                                            </Button>
                                        )}
                                    </Flex>
                                    <Divider borderColor="black" borderWidth="2px" my={4} />
                                    {subTypeIndex === subTypeArray.length - 1 && (
                                        <AddButton
                                            alignSelf="flex-start"
                                            handleClick={() => subTypeHelpers.push(createNewSubType())}
                                            label={`Add Subtype${type.typeName ? ` for ${type.typeName}` : ''}`}
                                        />
                                    )}
                                </AddSubType>
                            ))
                        )}
                    </FieldArray>
                </Flex>
            </Box>
            {children}
        </>
	);
}
