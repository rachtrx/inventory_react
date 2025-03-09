import { useEffect, useState } from "react"
import InputFormControl from "../../../utils/InputFormControl"
import { FieldArray, useFormikContext } from 'formik';
import { CreatableSingleSelectFormControl, SearchSingleSelectFormControl, SingleSelectFormControl } from "../../../utils/SelectFormControl";
import { Box, Divider, Flex } from "@chakra-ui/react";
import DateInputControl from "../../../utils/DateInputControl";
import { useFormModal } from "../../../../../context/ModalProvider";
import { createNewUser, useUserTags } from "../UserTagsProvider";
import { AddButton, RemoveButton } from "../../../utils/ItemButtons";
import userService from "../../../../../services/UserService";

export const DelTag = function({ tag, tagIndex, children }) {

	const { tagOptions, userOptions } = useUserTags();
	const { setFieldValue } = useFormikContext();

	const updateUserFields = (assetIndex, selected) => {

		if (!selected?.value) {
			setFieldValue(`tags.${tagIndex}.users.${assetIndex}.userId`, '');
			setFieldValue(`tags.${tagIndex}.users.${assetIndex}.userTagId`, '');
            return;
		}
		
        console.log(selected);
        setFieldValue(`tags.${tagIndex}.users.${assetIndex}.userId`, selected?.userId || '');
		setFieldValue(`tags.${tagIndex}.users.${assetIndex}.userTagId`, selected.tags?.find(tag => tag.isMatching)?.userTagId || '');
    }

    const updateTagFields = (selected, tagIndex) => {

		if (!selected?.value) {
			setFieldValue(`tags.${tagIndex}.users`, []);
            return;
		}

        console.log(selected);
		setFieldValue(`tags.${tagIndex}.users`, [createNewUser()]);
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
                    <FieldArray name={`tags.${tagIndex}.users`}>
                        {userHelpers => (
                            tag.users.map((user, userIndex, userArray) => (
                                <Flex direction="column" gap={2} key={user.key}>
                                    <Flex key={user.key} alignItems="center"gap={2}>
                                        <SingleSelectFormControl
                                            name={`tags.${tagIndex}.users.${userIndex}.userName`}
                                            searchFn={value => userService.fetchUntagUser(value, tag.tagId)} // TODO handle shareds
                                            updateFields={(selected) => updateUserFields(userIndex, selected)}
                                            placeholder="User Name"
                                            initialOptions={userOptions?.[tag.tagName] || []}
                                        />
                                        <RemoveButton
                                            ariaLabel="Remove Asset"
                                            handleClick={() => userHelpers.remove(userIndex)}
                                        />
                                    </Flex>
                                    <InputFormControl name={`tags.${tagIndex}.users.${userIndex}.remarks`} label={`Tag Remarks`}/>
                                    <Divider borderColor="black" borderWidth="0.5px" my={4} />
                                    {userIndex === userArray.length - 1 && (
                                        <AddButton
                                            handleClick={() => userHelpers.push(createNewUser())}
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