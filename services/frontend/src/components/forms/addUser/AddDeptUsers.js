import { Box, Button, Separator, Flex, IconButton, Spacer, Tooltip, VStack } from "@chakra-ui/react"
import { FieldArray, useFormikContext } from "formik"
import { ResponsiveText } from "../../utils/ResponsiveText"
import React, { useEffect, useState } from "react"
import { AddButton } from "../utils/ItemButtons"
import { CreatableSingleSelectFormControl } from "../utils/SelectFormControl"
import { createNewUser, useAddUsers } from "./AddUsersProvider"
import InputFormControl from "../utils/InputFormControl"
import DateInputControl from "../utils/DateInputControl"

export const AddDeptUsers = ({dept, deptIndex, children}) => {

    const { deptOptions } = useAddUsers();
	const { setFieldValue } = useFormikContext();

    const handleDeptUpdate = (selected) => {
        if (!selected || selected.typeId) { // IMPT dont update for new created types
            setFieldValue(`depts.${deptIndex}.deptId`, selected?.deptId || '');
            setFieldValue(`depts.${deptIndex}.users`, [createNewUser()]);
        } 
    };

	return (
        <>
            <Box position='relative'>
                <Flex direction="column" gap={2} key={dept.key}>
                    <CreatableSingleSelectFormControl
                        name={`depts.${deptIndex}.deptName`}
                        label={`Department`} 
                        placeholder="Select Department"
                        updateFields={handleDeptUpdate}
                        initialOptions={deptOptions}
                    />
                    <FieldArray name={`depts.${deptIndex}.users`}>
                        {userHelpers => (
                            dept.users.map((user, userIndex, userArray) => (
                                <Flex direction="column" gap={2}>
                                    {/* Add the User */}
                                    <InputFormControl
                                        label={`User Name`}
                                        name={`depts.${deptIndex}.users.${userIndex}.userName`} 
                                        placeholder="Enter user name"
                                    />
                                    <DateInputControl label="Added Date" name={`depts.${deptIndex}.users.${userIndex}.addDate`} />
                                    <InputFormControl label={`Remarks for user`} name={`depts.${deptIndex}.users.${userIndex}.remarks`}/>
                                    {/* User Control */}
                                    <Flex mt={2} gap={4} justifyContent="space-between">
                                        {userArray.length > 1 && (
                                            <Button
                                                type="button"
                                                onClick={() => userHelpers.remove(userIndex)}
                                                alignSelf="flex-start"
                                                colorPalette="red"
                                            >
                                            <ResponsiveText>`Remove User`</ResponsiveText>
                                            </Button>
                                        )}
                                    </Flex>
                                    <Separator borderColor="black" borderWidth="2px" my={4} />
                                    {userIndex === userArray.length - 1 && (
                                        <AddButton
                                            alignSelf="flex-start"
                                            handleClick={() => userHelpers.push(createNewUser())}
                                            label={`Add User${dept.deptName ? ` for ${dept.deptName}` : ''}`}
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
