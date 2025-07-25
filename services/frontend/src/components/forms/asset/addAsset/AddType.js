import { Box, Button, Divider, Flex } from "@chakra-ui/react"
import { FieldArray, useFormikContext } from "formik"
import { ResponsiveText } from "../../../utils/ResponsiveText"
import React, { useEffect, useState } from "react"
import { AddButton } from "../../utils/ItemButtons"
import { CreatableSingleSelectFormControl } from "../../utils/SelectFormControl"
import { createNewSubType, useAddAssets } from "./AddAssetsProvider"
import { AddSubType } from "./AddSubType"
import assetService from "../../../../services/AssetService"
import WarningCard from "../../utils/Warnings"

export const AddType = ({type, typeIndex, children}) => {

    const { typeOptions, addNewType, subTypeOptionsDict, setSubTypeOptionsDict } = useAddAssets();
	const { values, setFieldValue } = useFormikContext();

    useEffect(() => console.log(values), [values]);

    const handleTypeUpdate = async (selected) => {
        // console.log(selected?.typeId);
        // console.log(type?.typeId);

        console.log(selected);

        if (!selected || selected.typeId) { // IMPT dont update for new created types

            setFieldValue(`types.${typeIndex}.typeId`, selected?.typeId || '');

            if (!selected || selected.value !== type.typeName) {
                setFieldValue(`types.${typeIndex}.subTypes`, [createNewSubType()]);
            }

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

    useEffect(() => {
        console.log(typeOptions);
        if (!type.typeName || type.typeId) return;
        const matchedOption = typeOptions.find(option => option.typeId && option.value === type.typeName);
        if(matchedOption) setFieldValue(`types.${typeIndex}.typeId`, matchedOption.typeId);
    }, [typeOptions, setFieldValue, type, typeIndex]);

	return (
        <>
            <Box position='relative'>
                <Flex direction="column" gap={2} key={type.key}>
                    <CreatableSingleSelectFormControl
                        name={`types.${typeIndex}.typeName`}
                        label={`Type`} 
                        placeholder="Select Type"
                        updateFields={handleTypeUpdate}
                        initialOptions={typeOptions}
                    />
                    {type.typeName && !type.typeId && 
                        <WarningCard
                            message={`Create ${type.typeName}?`}
                            items={typeOptions}
                            itemAttr="value"
                            onCreate={async() => await addNewType(type.typeName)}
                        />
                    }
                    <FieldArray name={`types.${typeIndex}.subTypes`}>
                        {subTypeHelpers => (
                            type.subTypes.map((subType, subTypeIndex, subTypeArray) => (
                                <AddSubType
                                    key={subType.key}
                                    typeId={type.typeId}
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
