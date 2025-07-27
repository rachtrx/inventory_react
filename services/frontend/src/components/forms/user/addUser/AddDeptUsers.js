import { Box, Button, Divider, Flex, Text } from "@chakra-ui/react"
import { FieldArray, useFormikContext } from "formik"
import { useEffect } from "react"
import { AddButton } from "../../utils/ItemButtons"
import { CreatableSingleSelectFormControl } from "../../utils/SelectFormControl"
import { useAddUsers } from "./AddUsersProvider"
import InputFormControl from "../../utils/InputFormControl"
import DateInputControl from "../../utils/DateInputControl"
import WarningCard from "../../utils/WarningCard"
import { createNewUser } from "./helpers"
import RemarksFormControl from "../../utils/RemarksFormControl"

export const AddDeptUsers = ({dept, deptIndex, children}) => {

    const { deptOptions, addNewDept } = useAddUsers();
	const { setFieldValue } = useFormikContext();

    useEffect(() => {
        console.log(deptOptions);
        if (!dept.deptName || dept.deptId) return;
        const matchedOption = deptOptions.find(option => option.deptId && option.value === dept.deptName);
        if(matchedOption) setFieldValue(`depts.${deptIndex}.deptId`, matchedOption.deptId);
    }, [deptOptions, setFieldValue, dept, deptIndex]);

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
                    {dept.deptName && !dept.deptId && 
                        <WarningCard
                            message={`Create ${dept.deptName}?`}
                            items={deptOptions}
                            itemAttr="value"
                            onCreate={() => addNewDept(dept.deptName)}
                        />
                    }
                    <FieldArray name={`depts.${deptIndex}.users`}>
                        {userHelpers => (
                            dept.users.map((user, userIndex, userArray) => (
                                <Flex key={user?.key} direction="column" gap={2}>
                                    {/* Add the User */}
                                    <InputFormControl
                                        label={`User Name`}
                                        name={`depts.${deptIndex}.users.${userIndex}.userName`} 
                                        placeholder="Enter user name"
                                    />
                                    <InputFormControl
                                        label={`Email`}
                                        name={`depts.${deptIndex}.users.${userIndex}.email`} 
                                        placeholder="Enter email"
                                    />
                                    <DateInputControl label="Added Date" name={`depts.${deptIndex}.users.${userIndex}.addDate`} />
                                    <RemarksFormControl label={`Remarks for user`} name={`depts.${deptIndex}.users.${userIndex}.remarks`}/>
                                    {/* User Control */}
                                    <Flex mt={2} gap={4} justifyContent="space-between">
                                        {userArray.length > 1 && (
                                            <Button
                                                type="button"
                                                onClick={() => userHelpers.remove(userIndex)}
                                                alignSelf="flex-start"
                                                colorScheme="red"
                                            >
                                            <Text>Remove User</Text>
                                            </Button>
                                        )}
                                    </Flex>
                                    <Divider borderColor="black" borderWidth="2px" my={4} />
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
