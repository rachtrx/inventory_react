import { Box, Button, Divider, Flex, IconButton, Spacer, Tooltip, VStack } from "@chakra-ui/react"
import { FieldArray, useFormikContext } from "formik"
import { ResponsiveText } from "../../utils/ResponsiveText"
import React, { useEffect, useState } from "react"
import { AddButton } from "../utils/ItemButtons"
import { CreatableSingleSelectFormControl } from "../utils/SelectFormControl"
import { createNewAsset, createNewSubType, createNewType, useLoans } from "./AddAssetsProvider"
import { AddSubType } from "./AddSubType"
import assetService from "../../../services/AssetService"
import { AddAsset } from "./AddAsset"
import InputFormControl from "../utils/InputFormControl"

export const AddType = ({type, typeIndex, children}) => {

	const { values, setFieldValue } = useFormikContext();
    const [ subTypeOptions, setSubTypeOptions ] = useState([])
    const [ typeOptions, setTypeOptions ] = useState([])

    useEffect(() => {
        const getTypeFilters = async () => {
            const response = await assetService.getFilters('typeName');
            return response.data;
        }
        setTypeOptions(getTypeFilters());
    }, [])

    useEffect(() => {
        if (type.typeId === null || type.typeId === "") return;
        const getSubTypeFilters = async (typeId) => {
            const response = await assetService.getSubTypeFilters(typeId);
            return response.data;
        }
        setSubTypeOptions(getSubTypeFilters(type.typeId));
    }, [type.typeId])

	return (
        <>
            <Box position='relative'>
                <Flex direction="column" key={type.key}>
                    <CreatableSingleSelectFormControl
                        name={`types.${typeIndex}.typeId`}
                        placeholder="Select Type"
                        updateFields={(selected) => setFieldValue(`types.${typeIndex}.typeName`, selected?.typeName || '')}
                        initialOptions={typeOptions}
                    />
                    <FieldArray name={`types.${typeIndex}.subTypes`}>
                        {subTypeHelpers => (
                            type.subTypes.map((subType, subTypeIndex, subTypeArray) => (
                                <AddSubType
                                    key={subType.key}
                                    field={`types.${typeIndex}.subTypes.${subTypeIndex}`}
                                    subTypeOptions={subTypeOptions}
                                >
                                    {/* chilften are the helper functions */}
                                    <Flex mt={2} gap={4} justifyContent="space-between">
                                        {values.loans.length > 1 && (
                                            <Button
                                                type="button"
                                                onClick={() => subTypeHelpers.remove(subTypeIndex)}
                                                alignSelf="flex-start"
                                                colorScheme="red"
                                            >
                                            <ResponsiveText>Remove</ResponsiveText>
                                            </Button>
                                        )}
                                    </Flex>
                                    <Divider borderColor="black" borderWidth="2px" my={4} />
                                    {subTypeIndex === subTypeArray.length - 1 && (
                                        <AddButton
                                            handleClick={() => subTypeHelpers.push(createNewSubType())}
                                            label="Add Asset"
                                        />
                                    )};
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
