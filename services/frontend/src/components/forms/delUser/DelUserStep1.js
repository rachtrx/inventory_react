import { Box, Button, Separator, Flex } from "@chakra-ui/react";
import { ModalBody, ModalFooter } from "@chakra-ui/modal";
import ExcelFormControl from '../utils/ExcelFormControl';
import DateInputControl from "../utils/DateInputControl";
import { useFormModal } from "../../../context/ModalProvider";
import { FieldArray, Form, Formik, useFormikContext } from "formik";
import { useUI } from "../../../context/UIProvider";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { delNewUser, useDelUsers } from "./DelUsersProvider";
import { validateUniqueValues } from "../utils/validation";
import { setFieldError } from "../utils/validation";
import { ResponsiveText } from "../../utils/ResponsiveText";
import { AddButton } from "../utils/ItemButtons";
import { DelUser } from "./DelUser";

export const DelUserStep1 = () => {

    const { nextStep, formData, setValuesExcel } = useDelUsers();
    const { setFormType, reinitializeForm } = useFormModal();
    const { setLoading, showToast, handleError } = useUI();
    const [ warnings, setWarnings ] = useState({});
    const formRef = useRef(null);
  
    console.log('add user form rendered');
		console.log(formData);

    useEffect(() => reinitializeForm(formRef, formData), [formData, reinitializeForm]);
    
    const validateFieldWithId = (fieldDuplicates, fieldValue, idValue, fieldName) => {
      if (fieldValue && !idValue) return `${fieldName} not found`;
      if (fieldDuplicates.has(fieldValue)) return `${fieldName}s should be unique`;
      if (!fieldValue || fieldValue === '') return `${fieldName} is Required`;
      return null;
    }
  
    const validate = values => {
			// console.log(formRef.current?.values);
      const errors = {};
  
      const atDuplicates = validateUniqueValues(values.users, ['userName']);

      values.users.forEach((user, userIndex) => {
        const unError = validateFieldWithId(atDuplicates, user['userName'], user['userId'], "User Name");
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
          initialValues={formData}
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
                  <Separator borderColor="black" borderWidth="2px" my={2} />
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
                              colorPalette="red"
                            >
                            <ResponsiveText>{`Remove ${user.userName ? ` ${user.userName}` : ''}`}</ResponsiveText>
                            </Button>
                          )}
                        </Flex>
                        <Separator borderColor="black" borderWidth="2px" my={4} />
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
                  <Button colorPalette="blue" type="submit" isDisabled={errors.users}>Next</Button>
                </ModalFooter>
              </Form>
            );
          }}
        </Formik>
      </Box>
    );
  };