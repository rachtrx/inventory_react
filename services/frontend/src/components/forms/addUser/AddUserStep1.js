import { Box, Button, Divider, Flex, ModalBody, ModalFooter, Spacer, VStack } from "@chakra-ui/react";
import ExcelFormControl from '../utils/ExcelFormControl';
import DateInputControl from "../utils/DateInputControl";
import { useFormModal } from "../../../context/ModalProvider";
import { FieldArray, Form, Formik, useFormikContext } from "formik";
import { useUI } from "../../../context/UIProvider";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { createNewDept, useAddUsers } from "./AddUsersProvider";
import { validateUniqueValues } from "../utils/validation";
import { setFieldError } from "../utils/validation";
import { AddDeptUsers } from "./AddDeptUsers";
import { ResponsiveText } from "../../utils/ResponsiveText";
import { AddButton } from "../utils/ItemButtons";

export const AddUserStep1 = () => {

    const { nextStep, formData, setValuesExcel } = useAddUsers();
    const { setFormType, reinitializeForm } = useFormModal();
    const { setLoading, showToast, handleError } = useUI();
    const [ warnings, setWarnings ] = useState({});
    const formRef = useRef(null);
  
    console.log('add user form rendered');
		console.log(formData);

    useEffect(() => reinitializeForm(formRef, formData), [formData, reinitializeForm]);
    
    const validateField = (fieldDuplicates, fieldValue, fieldName) => {
      if (fieldDuplicates.has(fieldValue)) return `${fieldName}s should be unique`;
      if (!fieldValue) return `${fieldName} is Required`;
      return null;
    }
  
    const validate = values => {
			console.log(formRef.current?.values);
      const errors = {};
      
      const deptNameDuplicates = validateUniqueValues(values.depts, ['deptName']);
      const userNameDuplicates = validateUniqueValues(values.depts, ['users', 'userName']);

      values.depts.forEach((dept, deptIndex) => {
        console.log(dept);
        console.log(deptIndex);
        const deptError = validateField(deptNameDuplicates, dept['deptName'], "Dept Name");
          if (deptError) {
            setFieldError(errors, ['depts', deptIndex, 'deptName'], deptError);
          }
        dept.users.forEach((user, userIdx) => {
          const userNameError = validateField(userNameDuplicates, user['userName'], "User Name");
          if (userNameError) {
            setFieldError(errors, ['depts', deptIndex, 'users', userIdx, 'userName'], userNameError);
          }
        })
      });
    
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
                  <ExcelFormControl loadValues={setValuesExcel} templateCols={['deptName', 'userName', 'addDate', 'remarks']}/>
                  <Divider borderColor="black" borderWidth="2px" my={2} />
                  <FieldArray name="depts">
                  {deptHelpers => (
                    values.depts.map((dept, deptIndex, array) => (
											// Change to single asset only
                      <AddDeptUsers
                        key={dept.key}
                        dept={dept}
                        deptIndex={deptIndex}
                        deptHelpers={deptHelpers}
                        isLast={deptIndex === array.length - 1}
                      >
                        {/* children are the helper functions */}
                        <Flex mt={2} gap={4} justifyContent="space-between">
                          {array.length > 1 && (
                            <Button
                              type="button"
                              onClick={() => deptHelpers.remove(deptIndex)}
                              alignSelf="flex-start"
                              colorScheme="red"
                            >
                            <ResponsiveText>{`Remove ${dept.deptName ? ` ${dept.deptName}` : ''}`}</ResponsiveText>
                            </Button>
                          )}
                        </Flex>
                        <Divider borderColor="black" borderWidth="2px" my={4} />
                        {deptIndex === array.length - 1 && (
                        <AddButton
                            handleClick={() => deptHelpers.push(createNewDept())}
                            label="Add Dept"
                        />
                        )}
                      </AddDeptUsers>
                    ))
                  )}
                  </FieldArray>
                </ModalBody>
                <ModalFooter>
                  <Button variant="outline" onClick={() => setFormType(null)}>Cancel</Button>
                  <Button colorScheme="blue" type="submit" isDisabled={errors.depts}>Next</Button>
                </ModalFooter>
              </Form>
            );
          }}
        </Formik>
      </Box>
    );
  };