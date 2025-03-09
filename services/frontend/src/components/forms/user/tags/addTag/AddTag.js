import { Box, Button, Divider, Flex, IconButton, Spacer, Tooltip, VStack } from "@chakra-ui/react"
import { FieldArray, useFormikContext } from "formik"
import { ResponsiveText } from "../../../../utils/ResponsiveText"
import React, { useEffect, useState } from "react"
import { AddButton, RemoveButton } from "../../../utils/ItemButtons"
import { CreatableSingleSelectFormControl, SearchSingleSelectFormControl, SingleSelectFormControl } from "../../../utils/SelectFormControl"
import { createNewUser, useUserTags } from "../UserTagsProvider"
import InputFormControl from "../../../utils/InputFormControl"
import userService from "../../../../../services/UserService"

export const AddTag = ({tag, tagIndex, children}) => {

    const { tagOptions, userOptions } = useUserTags();
	const { setFieldValue } = useFormikContext();

    const updateUserFields = (userIndex, selected) => {

		if (!selected?.value) {
			setFieldValue(`tags.${tagIndex}.users.${userIndex}.userId`, '');
			setFieldValue(`tags.${tagIndex}.users.${userIndex}.userTagId`, '');
            return;
		}
		
        console.log(selected);
        setFieldValue(`tags.${tagIndex}.users.${userIndex}.userId`, selected?.userId || '');
		setFieldValue(`tags.${tagIndex}.users.${userIndex}.userTagId`, selected.tags?.find(tag => tag.isMatching)?.userTagId || '');
    }

    const updateTagFields = (selected, tagIndex) => {

        console.log(selected);

        if (!selected?.value) {
			setFieldValue(`tags.${tagIndex}.users`, []);
            return;
		}
        
        setFieldValue(`tags.${tagIndex}.users`, [createNewUser()]);
        setFieldValue(`tags.${tagIndex}.tagId`, selected?.tagId || '');
    }

	return (
        <>
            <Box position='relative'>
                <Flex direction="column" gap={2}>
                    <CreatableSingleSelectFormControl
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
                                        <SearchSingleSelectFormControl
                                            name={`tags.${tagIndex}.users.${userIndex}.userName`}
                                            searchFn={value => userService.fetchTagUser(value, tag.tagId)}
                                            updateFields={(selected) => updateUserFields(userIndex, selected)}
                                            placeholder="User Name"
                                            initialOptions={userOptions?.[tag.tagName] || []}
                                        />
                                        <RemoveButton
                                            ariaLabel="Remove User"
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
	);
}
