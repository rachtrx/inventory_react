import * as Yup from 'yup';
import { Button, Flex, Popover, PopoverCloseButton, PopoverContent, PopoverTrigger, Text, useDisclosure, VStack } from "@chakra-ui/react";
import { useItems } from "../../../context/ItemsProvider";
import { useUI } from "../../../context/UIProvider";
import { FormType, useForm } from "../../../context/FormProvider";
import { Form, Formik } from "formik";
import { BulkActionButton } from '../../buttons/BulkActionButton';
import { MultiSelectFormControl } from '../../forms/utils/SelectFormControl';
import { useEffect, useState } from 'react';
import { useUserTags } from '../../forms/user/tags/UserTagsProvider';

export const UntagAll = () => {

    const { selectedItems: users } = useItems();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { handleError } = useUI();
    const { triggerRefresh, setInitialValues, setFormType, formRef } = useForm();
    const { tagOptions } = useUserTags();
    const [ validTagOptions, setValidTagOptions ] = useState([]);
    const [ sharedTagIds, setSharedTagIds ] = useState(new Set());
    const [ key, setKey ] = useState(1)

    useEffect(() => {
        const sharedTagIds = users.length
            ? users
                .map(u => new Set(u.tags?.map(t => t.tagId) || []))
                .reduce((acc, set) => {
                    return new Set([...acc].filter(x => set.has(x)));
                })
            : new Set();
        const validOptions = tagOptions.filter(o => sharedTagIds.has(o.tagId));
        const invalidOptions = tagOptions.filter(o => !sharedTagIds.has(o.tagId)).map(o => ({
            ...o,
            isDisabled: true
        }));
        console.log(validOptions);
        setSharedTagIds(sharedTagIds);
        setValidTagOptions([...validOptions, ...invalidOptions])
        setKey(prev => prev += 1)
    }, [users, tagOptions])

    // Handler to submit the updated return date along with selected loan IDs
    const handleSubmit = async (values, actions) => {
        try {
            setInitialValues({
                tagIds: values.tags.map(name => {
                    const tag = validTagOptions.find(tag => tag.value === name)
                    if (!tag) throw new Error(`Tag ${name} not valid`)
                    return tag.tagId
                }), 
                userIds: users.map(u => u.userId)
            });
            setFormType(FormType.UNTAG_USER);
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
                tags: `The following tags are invalid: ${missingTags.join(', ')}`
            }
            else return {}
        }
    }

    if (users?.length && !sharedTagIds?.size) return <BulkActionButton disabled>Remove Tags</BulkActionButton>;
    if (!users?.length) return <BulkActionButton onClick={() => setFormType(FormType.UNTAG_USER)}>Remove Tags</BulkActionButton>;

    return (
        <Popover isOpen={isOpen} onClose={onClose} placement="bottom" closeOnBlur>
            <PopoverTrigger>
                <BulkActionButton onClick={onOpen}>
                    Remove Tags
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
                            <Text fontSize="lg">Untag Users</Text>
                            <VStack
                                align="center"
                                overflowY="auto"
                                maxH="300px"
                                border="1px solid"
                                borderColor="gray.200"
                                p={2}
                            >
                            {users.map((u, index) => (
                                <Text fontSize="xs" key={index}>
                                    {u.userName}
                                </Text>
                            ))}
                            </VStack>

                            <MultiSelectFormControl
                                key={key}
                                name="tags"
                                placeholder="Select Tags"
                                options={validTagOptions}
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