import { useEffect, useState } from "react";
import { CreatableSingleSelectFormControl } from "../forms/utils/SelectFormControl";
import WarningCard from "../forms/utils/Warnings";
import { Form, Formik } from "formik";
import assetService from "../../services/AssetService";
import { useLoading } from "../../context/LoadingProvider";
import { useUI } from "../../context/UIProvider";
import { useDrawer } from "../../context/DrawerProvider";
import { Box, Button, Flex, Text } from "@chakra-ui/react";
import { EditIcon } from "@chakra-ui/icons";
import EditCancelButton from "../forms/utils/EditCancelButton";

const SelectEditableField = ({label, name, value, optionsFn, createFn, updateFn}) => {

    const [ options, setOptions ] = useState([])
    const { showToast, handleError, handleDevError } = useUI();
    const { setLoading } = useLoading();
    const { handleSave, editKey, setEditKey } = useDrawer();

    useEffect(() => {
        const getFilters = async () => {
            const response = await optionsFn(name);
            const options = response.data;
            console.log(options);
            setOptions(options.map(option => ({
                id: option.value,
                value: option.label,
                label: option.label
            })));
        };
        getFilters()
    }, [])

    const submitFn = async (values) => {
        setLoading(true);
        try {
            await updateFn(values);
            updateFn(name, values);
            // handleSave(name, values);
            setLoading(false);
            showToast('Successfully updated details', 'success', 500);
        } catch (err) {
            console.error(err);
            handleError(err);
            console.error("Error Handled");
            setLoading(false);
        }
    }

    const createItemFn = async (value, setFieldValue) => {
        try {
            setLoading(true);
            const response = await createFn(value);
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
                ...oldArray.filter(item => !(item.value === value && !item.id)),
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

    return (
        <>
            <Text fontSize="md">{label}:</Text>
            {editKey === name ? (
                <Formik
                    initialValues={{
                        newId: "",
                        newValue: "",
                        global: false
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
                                    updateFields={(selected) => setFieldValue('newId', selected?.id || "")}
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
                                    {values.newValue && !values.newId && (
                                        <WarningCard
                                            message={`Create ${values.newValue}?`}
                                            items={options}
                                            itemAttr="value"
                                            onCreate={() => createItemFn(values.newValue, setFieldValue)}
                                        />
                                    )}
                                    {values.newValue && values.newId && <Flex gap={2}>
                                        <Button
                                            type="button"
                                            onClick={() => {
                                                handleDevError();
                                                // setFieldValue("global", true);
                                                // handleSubmit();
                                            }}
                                        >
                                            Update All
                                        </Button>
                                        <Button
                                            type="button"
                                            onClick={() => {
                                                handleDevError();
                                                // setFieldValue("global", false);
                                                // handleSubmit();
                                            }}
                                        >
                                            Update One
                                        </Button>
                                    </Flex>}
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