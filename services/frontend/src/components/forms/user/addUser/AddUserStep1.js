import { Box, Button, Divider, Flex, ModalBody, ModalFooter, Text } from "@chakra-ui/react";
import ExcelFormControl from '../../utils/ExcelFormControl';
import { useForm } from "../../../../context/FormProvider";
import { FieldArray, Form, Formik } from "formik";
import { useUI } from "../../../../context/UIProvider";
import { useAddUsers } from "./AddUsersProvider";
import { compareDates, compareStrings, convertExcelDate, validateUniqueValues } from "../../utils/validation";
import { setFieldError } from "../../utils/validation";
import { AddDeptUsers } from "./AddDeptUsers";
import { AddButton } from "../../utils/ItemButtons";
import { createNewDept } from "./helpers";
import { useStep } from "../../../../context/StepProvider";

export const AddUserStep1 = () => {

    const { nextStep, formData } = useStep();
    const { deptOptions } = useAddUsers();
    const { setFormType, formRef, reinitializeForm } = useForm();
    const { handleError } = useUI();
    const initialFormValues = {
      depts: [createNewDept()],
    }
  
    console.log('add user form rendered');
		console.log(formData);

    const setValuesExcel = async (records) => {
      // CANNOT SEARCH FOR ASSET HERE, MAYBE CAN TRY IN FUTURE TO GET THE UPDATED VALUE
      try {
        const userNames = new Set();

        const recordsMap = {};

        records.forEach((record) => {

          console.log(record);

          Object.keys(record).forEach(field => {
            record[field] = field !== 'addDate'
              ? record[field].toString().trim()
              : convertExcelDate(record[field], record.__rowNum__);
          });
          
          ['deptName', 'userName'].forEach(field => {
            if (!record[field]) throw new Error(`Missing ${field} at line ${record.__rowNum__}`);
          });
          
          const { deptName, userName, addDate, remarks } = record;

          if (userNames.has(userName)) throw new Error(`Duplicate usernames found: ${userName}`);
          else userNames.add(userName);

          if (!recordsMap[deptName]) {
            recordsMap[deptName] = [];
          }
          
          recordsMap[deptName].push({
            userName,
            addDate,
            remarks
          });
        });

        const depts = [];

        Object.entries(recordsMap).forEach(([deptName, users]) => {
          const dept = deptOptions.find(option => compareStrings(option.value, deptName)) || '';

          depts.push(createNewDept({
            deptId: dept?.deptId || '',
            deptName: dept?.deptName || deptName,
            users: users,
          }))
        })
      
        reinitializeForm({
          depts: depts
        });

      } catch (error) {
        handleError(error);
      }
    };

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
      const emailDuplicates = validateUniqueValues(values.depts, ['users', 'email']);

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

          const emailError = user['email'] && validateField(emailDuplicates, user['email'], "Email");
          if (emailError) {
            setFieldError(errors, ['depts', deptIndex, 'users', userIdx, 'email'], emailError);
          }
          
          if (user['addDate'] && compareDates(user['addDate'])) {
            setFieldError(errors, ['depts', deptIndex, 'users', userIdx, 'addDate'], "Date cannot be after today");
          }
        })
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
                  <ExcelFormControl loadValues={setValuesExcel} templateCols={['deptName', 'userName', 'email', 'addDate', 'remarks']}/>
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
                            <Text>{`Remove ${dept.deptName ? ` ${dept.deptName}` : ''}`}</Text>
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