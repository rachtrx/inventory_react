import { Box, Button, Divider, Flex, Text } from "@chakra-ui/react"
import { FieldArray, useFormikContext } from "formik"
import { useEffect, useState } from "react"
import { AddButton } from "../../utils/ItemButtons"
import { CreatableSingleSelectFormControl } from "../../utils/SelectFormControl"
import { useAddAssets } from "./AddAssetsProvider"
import { AddSubType } from "./AddSubType"
import assetService from "../../../../services/AssetService"
import { createNewSubType } from "./helpers"

export const AddType = ({type, typeIndex, children}) => {

    const { typeOptions, setTypeOptions, addNewType, subTypeOptionsDict, setSubTypeOptionsDict } = useAddAssets();
	const { values, setFieldValue } = useFormikContext();

    const [subTypeOptions, setSubTypeOptions] = useState(() => subTypeOptionsDict?.[type?.typeId] || []);

    useEffect(() => console.log(values), [values]);

    const handleTypeUpdate = async (selected) => {
        console.log(selected?.typeId);
        console.log(type?.typeId);

        if (!selected || selected.typeId) { // IMPT dont update for new created types

            setFieldValue(`types.${typeIndex}.typeId`, selected?.typeId || '');

            if (!selected || selected.value !== type.typeName) {
                setFieldValue(`types.${typeIndex}.subTypes`, [createNewSubType()]);
            }
        }
    };

    useEffect(() => {
        if (!type.typeId) setSubTypeOptions([])
        else if (Array.isArray(subTypeOptionsDict[type.typeId])) setSubTypeOptions(subTypeOptionsDict[type.typeId]);
        else {
            const getSubTypeFilters = async () => {
                const response = await assetService.getSubTypeFilters([type.typeId]);
                const subTypeDict = response.data;
                setSubTypeOptions(subTypeDict[type.typeId]);
            }
            getSubTypeFilters();
        }
    }, [type?.typeId, subTypeOptionsDict])

    useEffect(() => {
        if (!type.typeId || !subTypeOptions?.length) return;
        setSubTypeOptionsDict((oldDict) => ({
            ...oldDict,
            [type.typeId]: subTypeOptions
        }));
    }, [type, subTypeOptions, setSubTypeOptionsDict]);

	return (
        <>
            <Box position='relative'>
                <Flex direction="column" gap={2} key={type.key}>
                    <CreatableSingleSelectFormControl
                        name={`types.${typeIndex}.typeName`}
                        label={`Type`} 
                        placeholder="Select Type"
                        handleClick={handleTypeUpdate}
                        options={typeOptions}
                        setOptions={setTypeOptions}
                        trueKey="typeId"
                        onCreate={addNewType}
                    />
                    <FieldArray name={`types.${typeIndex}.subTypes`}>
                        {subTypeHelpers => (
                            type.subTypes.map((subType, subTypeIndex, subTypeArray) => (
                                <AddSubType
                                    key={subType.key}
                                    typeId={type.typeId}
                                    field={`types.${typeIndex}.subTypes.${subTypeIndex}`}
                                    subType={subType}
                                    options={subTypeOptions}
                                    setOptions={setSubTypeOptions}
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
                                            <Text>{`Remove ${subType.subTypeName ? ` ${subType.subTypeName}` : ''}`}</Text>
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
