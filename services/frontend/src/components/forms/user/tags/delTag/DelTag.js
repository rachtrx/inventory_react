import { FieldArray, useFormikContext } from 'formik';
import { SearchSingleSelectFormControl, SingleSelectFormControl } from "../../../utils/SelectFormControl";
import { Box, Divider, Flex } from "@chakra-ui/react";
import { useUserTags } from "../UserTagsProvider";
import { AddButton, RemoveButton } from "../../../utils/ItemButtons";
import userService from "../../../../../services/UserService";
import { createNewUser } from "../helpers";
import RemarksFormControl from "../../../utils/RemarksFormControl";

export const DelTag = function({ tag, tagIndex, children }) {

	const { tagOptions, userOptions } = useUserTags();
	const { setFieldValue } = useFormikContext();

	const updateUserFields = (assetIndex, selected) => {

		if (!selected?.value) {
			setFieldValue(`tags.${tagIndex}.users.${assetIndex}.userId`, '');
			setFieldValue(`tags.${tagIndex}.users.${assetIndex}.tagIds`, []);
            return;
		}
		
        console.log(selected);
        setFieldValue(`tags.${tagIndex}.users.${assetIndex}.userId`, selected?.userId || '');
		setFieldValue(`tags.${tagIndex}.users.${assetIndex}.tagIds`, selected?.tags?.map(tag => tag.tagId) || []);
    }

    const updateTagFields = (selected, tagIndex) => {
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
                        handleClick={(selected) => updateTagFields(selected, tagIndex)}
                        options={tagOptions}
                    />
                    <Divider borderColor="black" borderWidth="0.5px" my={4} />
                    <FieldArray name={`tags.${tagIndex}.users`}>
                        {userHelpers => (
                            tag.users.map((user, userIndex, userArray) => (
                                <Flex direction="column" gap={2} key={user.key}>
                                    <Flex key={user.key} alignItems="center"gap={2}>
                                        <SearchSingleSelectFormControl
                                            name={`tags.${tagIndex}.users.${userIndex}.userName`}
                                            searchFn={value => userService.fetchUntagUser(value, tag.tagId)} // TODO handle shareds
                                            handleClick={(selected) => updateUserFields(userIndex, selected)}
                                            placeholder="User Name"
                                            options={userOptions}
                                        />
                                        <RemoveButton
                                            ariaLabel="Remove Asset"
                                            handleClick={() => userHelpers.remove(userIndex)}
                                        />
                                    </Flex>
                                    <RemarksFormControl name={`tags.${tagIndex}.users.${userIndex}.remarks`} label={`Tag Remarks`}/>
                                    <Divider borderColor="black" borderWidth="0.5px" my={4} />
                                    {userIndex === userArray.length - 1 && (
                                        <AddButton
                                            handleClick={() => userHelpers.push(createNewUser())}
                                            label="Add User"
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