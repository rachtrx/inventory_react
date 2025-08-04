import { useEffect, useState } from "react";
import { CreatableSingleSelectFormControl } from "../../forms/utils/SelectFormControl";
import WarningCard from "../../forms/utils/WarningCard";
import { Form, Formik } from "formik";
import { useLoading } from "../../../context/LoadingProvider";
import { useUI } from "../../../context/UIProvider";
import { useDrawer } from "../../../context/DrawerProvider";
import { Box, Button, Flex, Text, useDisclosure } from "@chakra-ui/react";
import EditCancelButton from "../../forms/utils/EditCancelButton";
import RadioOptions from "../RadioOptions";
import { Confirmation } from "./Confirmation";
import { useAuth } from "../../../context/AuthProvider";
import { useEditMode } from "../../../context/EditModeProvider";

const SelectEditableField = ({label, name, id, value, createFn, getUpdateOptions, customOptions}) => {

    const { admin } = useAuth()
    const [ options, setOptions ] = useState([])
    const { showToast, handleError } = useUI();
    const { setLoading } = useLoading();
    const { updateItem, editKey, currentItem } = useDrawer(); 
    const { editable } = useEditMode();

    const { isOpen, onOpen, onClose } = useDisclosure();

    const getDefaultUpdateOptions = (newValue) => ([
        { value: "update-delete", label: `This action RENAMES ALL records of ${value} to ${newValue}, DELETING ${value}` },
        { value: "update-keep", label: `This action TRANSFERS ALL records of ${value} to ${newValue}, KEEPING ${value}` },
        { value: "update-one", label: `This action TRANSFERS only this record of ${value} to ${newValue}` },
    ]);

    const getOptionsFunc = getUpdateOptions || getDefaultUpdateOptions;

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
        if (values.email !== admin.email) throw new Error(`Emails do not match!`);
        await updateItem({name, oldId: id, itemId: currentItem.breadcrumbId, ...values});
        onClose();
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
                value: itemData[name],
                label: itemData[name]
            };
    
            setOptions(oldArray => [
                ...oldArray.filter(o => !(o.value === newValue && !o.id)),
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
            {editKey === name && editable ? (
                <Formik
                    initialValues={{
                        newId: id,
                        newValue: value,
                        email: '',
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
                                    size="sm"
                                    name={'newValue'}
                                    handleClick={(selected) => handleOption(selected, setFieldValue)}
                                    options={options}
                                    setOptions={setOptions}
                                    placeholder={`Enter new ${name}`}
                                    trueKey="id"
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
                                            updateOptions={getOptionsFunc(values.newValue)}
                                        />
                                    )}

                                    {values.updateType && values.updateType !== "update-delete" && !values.newId && (
                                        <WarningCard
                                            message={`Create ${values.newValue}?`}
                                            items={options.filter(o => o.id)}
                                            itemAttr="value"
                                            onCreate={() => createItemFn(values.newValue, setFieldValue)}
                                        />
                                    )}
                                    {values.updateType && (values.newId || values.updateType === 'update-delete') && (
                                        <Button
                                            colorScheme="blue"
                                            onClick={onOpen}
                                            alignSelf="start"
                                        >
                                            Proceed to Confirm
                                        </Button>
                                    )}
                                </Flex>
                            </Box>
                            <Confirmation
                                email={values.email}
                                setFieldValue={setFieldValue}
                                handleSubmit={handleSubmit}
                                isOpen={isOpen}
                                onClose={onClose}
                            />
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