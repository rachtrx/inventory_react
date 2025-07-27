import { Box, Divider, Flex } from "@chakra-ui/react"
import { FieldArray, useFormikContext } from "formik"
import { useEffect } from "react"
import { AddButton, RemoveButton } from "../../../utils/ItemButtons"
import { CreatableSingleSelectFormControl, SearchSingleSelectFormControl } from "../../../utils/SelectFormControl"
import { useUserTags } from "../UserTagsProvider"
import userService from "../../../../../services/UserService"
import WarningCard from "../../../utils/WarningCard"
import { createNewUser } from "../helpers"
import RemarksFormControl from "../../../utils/RemarksFormControl"

export const AddTag = ({tag, tagIndex, children}) => {

    const { tagOptions, userOptions, addNewTag } = useUserTags();
	const { setFieldValue } = useFormikContext();

    useEffect(() => {
        console.log(tagOptions);
        if (!tag.tagName || tag.tagId) return;
        const matchedOption = tagOptions.find(option => option.tagId && option.value === tag.tagName);
        if(matchedOption) setFieldValue(`tags.${tagIndex}.tagId`, matchedOption.tagId);
    }, [tagOptions, setFieldValue, tag, tagIndex]);

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
                    {tag.tagName && !tag.tagId && 
                        <WarningCard
                            message={`Create ${tag.tagName}?`}
                            items={tagOptions}
                            itemAttr="value"
                            onCreate={() => addNewTag(tag.tagName)}
                        />
                    }
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
                                    <RemarksFormControl name={`tags.${tagIndex}.users.${userIndex}.remarks`} label={`Tag Remarks`}/>
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
