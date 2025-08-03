import { Box, Button, Divider, Flex, ModalBody, ModalFooter, Text } from "@chakra-ui/react";
import ExcelFormControl from '../../utils/ExcelFormControl';
import { useForm } from "../../../../context/FormProvider";
import { FieldArray, Form, Formik } from "formik";
import { useUI } from "../../../../context/UIProvider";
import { useDelUsers } from "./DelUsersProvider";
import { compareStrings, convertExcelDate, validateUniqueValues } from "../../utils/validation";
import { setFieldError } from "../../utils/validation";
import { AddButton } from "../../utils/ItemButtons";
import { DelUser } from "./DelUser";
import { delNewUser } from "./helpers";
import { useStep } from "../../../../context/StepProvider";
import userService from "../../../../services/UserService";

export const DelUserStep1 = () => {

    const { setUserOptions } = useDelUsers();
    const { nextStep, formData } = useStep();
    const { setFormType, formRef, reinitializeForm } = useForm();
    const { handleError } = useUI();

    const initialFormValues = {
        users: [delNewUser()],
      }
  
    console.log('add user form rendered');
		console.log(formData);

    const setValuesExcel = async (records) => {
      // CANNOT SEARCH FOR ASSET HERE, MAYBE CAN TRY IN FUTURE TO GET THE UPDATED VALUE
      try {
        const userNames = new Set();
        // const serialNumbers = new Set();

        records.forEach((record) => {

          Object.keys(record).forEach(field => {
            record[field] = field !== 'delDate'
              ? record[field]?.toString().trim()
              : record[field] ? convertExcelDate(record[field], record.__rowNum__) : new Date();
          });

          ['userName'].forEach(field => {
            if (!record[field]) throw new Error(`Missing ${field} at line ${record.__rowNum__}`);
          });
          
          if (userNames.has(record.userName)) throw new Error(`Duplicate records for userName: ${record.userName} were found`);
          else userNames.add(record.userName);
        });

        if (userNames.size === 0) throw new Error("No user names found!")

        const userResponse = await userService.fetchUserDel([...userNames]);
        const newUserOptions = userResponse.data;
        setUserOptions(newUserOptions);

        const users = records.map((record) => {
          const { userName, remarks, delDate } = record;
          const matchedUserOption = newUserOptions.find(option => compareStrings(option.value, userName));
          
          if (!matchedUserOption || matchedUserOption.isDisabled) {
            console.log(userName);
            return {
              userName, // Pass userName regardless of whether id is found
              delDate,
              remarks,
          };
          } else {
            return {
                userId: matchedUserOption ? matchedUserOption.userId : null,
                lastEventDate: matchedUserOption ? matchedUserOption.lastEventDate : null,
                userName,
                delDate,
                remarks,
            };
          }
        })
      
        reinitializeForm({
          users: users.map(user => delNewUser(user))
        });

      } catch (error) {
        handleError(error);
      }
    };
    
    const validateFieldWithId = (fieldDuplicates, fieldValue, idValue, fieldName) => {
      if (fieldValue && !idValue) return `${fieldValue} not found`;
      if (fieldDuplicates.has(fieldValue)) return `${fieldName}s should be unique`;
      if (!fieldValue || fieldValue === '') return `${fieldName} is Required`;
      return null;
    }
  
    const validate = values => {
			// console.log(formRef.current?.values);
      const errors = {};
  
      const unDuplicates = validateUniqueValues(values.users, ['userName']);

      values.users.forEach((user, userIndex) => {

        const unError = validateFieldWithId(unDuplicates, user['userName'], user['userId'], "User Name");
        if (unError) {
          setFieldError(errors, ['users', userIndex, 'userName'], unError);
        }

        if (user.userId && !user.lastEventDate) setFieldError(errors, ['users', userIndex, 'delDate'], "Error retrieving last event date");

        console.log(user.lastEventDate);
        console.log(user.delDate);
        if (new Date(user.lastEventDate) > user.delDate) {
          setFieldError(errors, ['users', userIndex, 'delDate'], `Date must be after last event date ${user.lastEventDate}`); // TODO convert to string
        }
      });
    
      console.log(errors);
      return errors;
    };
  
    return (
      <Box>
        <Formik
          initialValues={initialFormValues}
          onSubmit={nextStep}
          validate={validate}
          validateOnChange={true}
          // validateOnBlur={true}
          innerRef={formRef}
          // enableReinitialize={true}
        >
          {({ values, errors }) => {
            return (
              <Form>
                <ModalBody>
                  <ExcelFormControl loadValues={setValuesExcel} templateCols={['userName', 'delDate', 'remarks']}/>
                  <Divider borderColor="black" borderWidth="2px" my={2} />
                  <FieldArray name="users">
                  {userHelpers => (
                    values.users.map((user, userIndex, array) => (
											// Change to single user only
                      <DelUser
                        key={user.key}
                        field={`users.${userIndex}`}
                        user={user}
                      >
                        {/* children are the helper functions */}
                        <Flex mt={2} gap={4} justifyContent="space-between">
                          {array.length > 1 && (
                            <Button
                              type="button"
                              onClick={() => userHelpers.remove(userIndex)}
                              alignSelf="flex-start"
                              colorScheme="red"
                            >
                            <Text>{`Remove ${user.userName ? ` ${user.userName}` : ''}`}</Text>
                            </Button>
                          )}
                        </Flex>
                        <Divider borderColor="black" borderWidth="2px" my={4} />
                        {userIndex === array.length - 1 && (
                        <AddButton
                            handleClick={() => userHelpers.push(delNewUser())}
                            label="Add User"
                        />
                        )}
                      </DelUser>
                    ))
                  )}
                  </FieldArray>
                </ModalBody>
                <ModalFooter>
                  <Button variant="outline" onClick={() => setFormType(null)}>Cancel</Button>
                  <Button 
                    colorScheme="blue" 
                    type="submit"
                    onClick={() => {
                      if (Object.keys(errors).length !== 0) {
                        handleError("Please check for invalid data in form")
                      }
                    }}
                  >Next</Button>
                </ModalFooter>
              </Form>
            );
          }}
        </Formik>
      </Box>
    );
  };