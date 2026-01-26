import * as Yup from 'yup';
import { Button, Flex, Popover, PopoverCloseButton, PopoverContent, PopoverTrigger, Text, useDisclosure, VStack } from "@chakra-ui/react";
import { useItems } from "../../../context/ItemsProvider";
import { useUI } from "../../../context/UIProvider";
import { FormType, useForm } from "../../../context/FormProvider";
import { Form, Formik } from "formik";
import { BulkActionButton } from '../../buttons/BulkActionButton';
import { useFormModal } from '../../forms/control/FormModalProvider';
import { CreatableMultiSelectFormControl } from '../../forms/utils/SelectFormControl';
import { useAssetTags } from '../../forms/asset/tags/AssetTagsProvider';
import { useEffect, useState } from 'react';

export const TagAll = () => {

    const { selectedItems: assets } = useItems();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { handleError, showToast } = useUI();
    const { triggerRefresh, setInitialValues, setFormType, formRef } = useForm();
    const { tagOptions, setTagOptions, addNewTag } = useAssetTags();
    const [ validTagOptions, setValidTagOptions ] = useState([]);
    const [ key, setKey ] = useState(1)

    useEffect(() => {
        console.log(tagOptions);
        const allTagIds = new Set(assets.flatMap(a => a.tags?.map(t => t.tagId) || []));
        console.log(allTagIds);
        const validOptions = tagOptions.filter(o => !allTagIds.has(o.tagId));
        const invalidOptions = tagOptions.filter(o => allTagIds.has(o.tagId)).map(o => ({
            ...o,
            isDisabled: true
        }));
        console.log(validOptions);
        setValidTagOptions([...validOptions, ...invalidOptions])
        setKey(prev => prev += 1)
    }, [assets, tagOptions]);

    useEffect(() => {
        if (validTagOptions?.length > tagOptions?.length) {
            const newTagOptions = []
            validTagOptions.forEach(o => {
                const { isDisabled, ...rest } = o;
                newTagOptions.push(rest)
            })
            setTagOptions(newTagOptions);
        }
    }, [validTagOptions, tagOptions, setTagOptions])

    // Handler to submit the updated return date along with selected loan IDs
    const handleSubmit = async (values, actions) => {
        try {
            setInitialValues({
                tagIds: values.tags.map(name => {
                    const tag = validTagOptions.find(tag => tag.value === name)
                    if (!tag) throw new Error(`Tag ${name} not valid`)
                    return tag.tagId
                }),
                assetIds: assets.map(a => a.assetId)
            });
            setFormType(FormType.TAG_ASSET)
            actions.resetForm();
            triggerRefresh();
            onClose();
        } catch (err) {
            handleError(err);
        }
    };

    const validate = (values) => {
        console.log(values);
        const { tags: tagNames } = values;
        if (!tagNames.length) return { tags: `Tag is required`}
        else {
            const missingTags = tagNames.filter(name => !validTagOptions.some(tag => tag.value === name));
            if (missingTags.length) return {
                tags: `The following tags have not been created: ${missingTags.join(', ')}`
            }
            else return {}
        }
    }

    if (!assets?.length) return <BulkActionButton onClick={() => setFormType(FormType.TAG_ASSET)}>Add Tags</BulkActionButton>;

    return (
        <Popover isOpen={isOpen} onClose={onClose} placement="bottom" closeOnBlur>
            <PopoverTrigger>
                <BulkActionButton onClick={onOpen}>
                    Add Tags
                </BulkActionButton>
            </PopoverTrigger>

            <PopoverContent p={4} boxShadow="lg">
                <PopoverCloseButton />
                <Formik
                    initialValues={{ tags: [] }}
                    onSubmit={async (values, actions) => {
                    handleSubmit(values, actions);
                    actions.setSubmitting(false);
                    }}
                    validate={validate}
                    innerRef={isOpen ? formRef : undefined}
                >
                    <Form>
                        <Flex direction="column" gap={2}>
                            <Text fontSize="lg">Tag Assets</Text>
                            <VStack
                                align="center"
                                overflowY="auto"
                                maxH="300px"
                                border="1px solid"
                                borderColor="gray.200"
                                p={2}
                            >
                            {assets.map((a, index) => (
                                <Text fontSize="xs" key={index}>
                                {a.serialNumber}
                                </Text>
                            ))}
                            </VStack>

                            <CreatableMultiSelectFormControl
                                key={key}
                                name="tags"
                                placeholder="Select Tags"
                                options={validTagOptions}
                                setOptions={setValidTagOptions}
                                onCreate={addNewTag}
                                trueKey="tagId"
                            />

                            <Button type="submit" mt={3} colorScheme="blue">
                                Submit
                            </Button>
                        </Flex>
                    </Form>
                </Formik>
            </PopoverContent>
        </Popover>
    )
}