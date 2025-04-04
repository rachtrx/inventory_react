import { useEffect, useState } from "react";
import { CreatableSingleSelectFormControl } from "../forms/utils/SelectFormControl";
import WarningCard from "../forms/utils/Warnings";
import { Form, Formik } from "formik";
import assetService from "../../services/AssetService";
import { useLoading } from "../../context/LoadingProvider";
import { useUI } from "../../context/UIProvider";
import { useDrawer } from "../../context/DrawerProvider";
import { Box, Button, Flex, HStack, Radio, RadioGroup, Stack, Text, Tooltip } from "@chakra-ui/react";
import { CheckIcon, EditIcon, InfoIcon } from "@chakra-ui/icons";
import EditCancelButton from "../forms/utils/EditCancelButton";
import { ResponsiveText } from "./ResponsiveText";
import RadioOptions from "./RadioOptions";

const SelectEditableField = ({label, name, id, value, createFn, updateOptions, customOptions}) => {

    const [ options, setOptions ] = useState([])
    const { showToast, handleError } = useUI();
    const { setLoading } = useLoading();
    const { updateState, editKey, currentItem } = useDrawer(); 

    const defaultUpdateOptions = [
        { value: "update-delete", label: `Update All and Discard ${value}` },
        { value: "update-keep", label: `Update All and Keep ${value}` },
        { value: "update-one", label: "Update One" },
    ];

    useEffect(() => {
        if (customOptions) {
            setOptions(
                customOptions.map(option => ({
                    ...option,
                    isDisabled: id === option.value,
                }))
            );
        } else {
          const getFilters = async () => {
            try {
                const response = await currentItem.service.getFilters(name);
                const optionsData = response.data;
                console.log(optionsData);
                setOptions(
                    optionsData.map(option => ({
                        id: option.value,
                        value: option.label,
                        label: option.label,
                        isDisabled: id === option.value,
                    }))
                );
            } catch (error) {
              handleError(error);
            }
          };
          getFilters();
        }
    }, [customOptions, name, currentItem, handleError, id]);

    const submitFn = async (values) => {
        setLoading(true);
        try {
            await currentItem.service.updateItem({name, oldId: id, itemId: currentItem.breadcrumbId, ...values});
            await updateState();
            showToast('Asset successfully updated', 'success', 500);
        } catch (err) {
            console.error(err);
            handleError(err);
        } finally {
            setLoading(false);
        }
    }

    const createItemFn = async (newValue, setFieldValue) => {
        try {
            setLoading(true);
            const response = await createFn(newValue);
            console.log(response);
    
            const itemData = response?.data?.data;
            if (!itemData || !itemData.id || !itemData[name]) {
                throw new Error("Invalid response from createFn");
            }
    
            const newOption = {
                id: itemData.id,
                value: itemData.id,
                label: itemData[name]
            };
    
            setOptions(oldArray => [
                ...oldArray.filter(item => !(item.value === newValue && !item.id)),
                newOption
            ]);
    
            setFieldValue("newId", newOption.id);
            setFieldValue("newValue", newOption.label);
    
            showToast(`${label} successfully added`, 'success', 500);
        } catch (error) {
            handleError(error);
        } finally {
            setLoading(false);
        }
    };

    const handleOption = (selected, setFieldValue) => {
        if (!selected) {
            setFieldValue('newId', id);
            setFieldValue('newValue', value);
            setFieldValue('updateType', null)
            return
        }
        setFieldValue('newId', selected?.id || "")
    }

    return (
        <>
            <Text fontSize="md">{label}:</Text>
            {editKey === name ? (
                <Formik
                    initialValues={{
                        newId: id,
                        newValue: value,
                        updateType: null
                    }}
                    onSubmit={(values) => {
                        console.log("Final submit", values);
                        submitFn(values);
                    }}
                >
                    {({ values, setFieldValue, handleSubmit }) => (
                        <Form>
                            <Box position="relative">
                                <CreatableSingleSelectFormControl
                                    name={'newValue'}
                                    updateFields={(selected) => handleOption(selected, setFieldValue)}
                                    initialOptions={options}
                                    placeholder={`Enter new ${name}`}
                                />

                                <Flex
                                    position="absolute"
                                    direction="column"
                                    left="0"
                                    right="0"
                                    mt="2"
                                    style={{ top: '100%' }}
                                    gap={2}
                                >
                                    {values.newValue && values.newId !== id && (
                                        <RadioOptions 
                                            name="updateType" 
                                            updateOptions={updateOptions || defaultUpdateOptions}
                                        />
                                    )}

                                    {values.updateType && values.updateType !== "update-delete" && !values.newId && (
                                        <WarningCard
                                            message={`Create ${values.newValue}?`}
                                            items={options}
                                            itemAttr="value"
                                            onCreate={() => createItemFn(values.newValue, setFieldValue)}
                                        />
                                    )}
                                    {values.updateType && (values.newId || values.updateType === 'update-delete') && (
                                        <Button
                                            leftIcon={<CheckIcon />} 
                                            colorScheme="green" 
                                            onClick={handleSubmit}
                                            alignSelf="start"
                                        >
                                            Save
                                        </Button>
                                    )}
                                </Flex>
                            </Box>
                        </Form>
                    )}
                </Formik>
            ) : (
                <Text fontSize="md">
                    {value}
                </Text>
            )}
            <EditCancelButton name={name}/>
        </>
    )
}

export default SelectEditableField;