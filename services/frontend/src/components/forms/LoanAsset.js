import { Box, Button, Flex, ModalBody, ModalFooter } from "@chakra-ui/react";
import ExcelToggle from "./utils/ExcelToggle";
import InputFormControl from './utils/InputFormControl';
import ExcelFormControl from './utils/ExcelFormControl';
import SelectFormControl, { CustomMultiSelectFormControl, MultiSelectFormControl } from "./utils/SelectFormControl";
import DateInputControl from "./utils/DateInputControl";
import FormToggle from "./utils/FormToggle";
import { useFormModal, actionTypes } from "../../context/ModalProvider";
import { useGlobal } from "../../context/GlobalProvider";
import { SingleSelectFormControl } from "./utils/SelectFormControl";
import { useCallback, useMemo, useState } from "react";
import { FieldArray, Form, Formik } from "formik";
import Toggle from "./utils/Toggle";
import assetService from "../../services/AssetService";
import { useUI } from "../../context/UIProvider";
import { LoanSingleAsset } from "./LoanSingleAsset";
import { FormikSignatureField } from "./utils/SignatureField";

const tags = {
  'IPad': [{
    value: 'Tag1',
    label: 'Tag1'
  }],
  'Laptop': [{
    value: 'Tag2',
    label: 'Tag2',
  }]
}

const addNewUser = () => ({
  'user-id': '',
  'assets': [{
    'asset-id': '',
    'bookmarked': false,
    'tags': [],
    'remarks': '',
  }],
  'bookmark-user': false,
  'signature': ''
})

const LoanAsset = () => {

  console.log('loan form rendered');

  const { isExcel, setIsExcel, users, handleUserInputChange, onModalClose } = useFormModal()
  const { setLoading, showToast, handleError } = useUI();
  const [options, setOptions] = useState({
    tags: tags, // set to [] at the start
  });

  console.log(options.tags['Laptop'])

  const checkFn = useCallback(() => {
    setIsExcel(true);
  }, [setIsExcel]); // Dependencies array includes setIsExcel

  const uncheckFn = useCallback(() => {
      setIsExcel(false);
  }, [setIsExcel]); // Dependencies array includes setIsExcel

  const initialValuesManual = {
    users: [addNewUser()],
    'loaned-date': new Date()
  };

  const initialValuesExcel = {
    file: null
  };

  const handleSubmitManual = async (values, actions) => {
    setLoading(true);
    console.log('Manual Form Values:', values);
    try {
      await assetService.loanAsset(values);
      actions.setSubmitting(false);
      setLoading(false);
      showToast('Assets successfully loaned', 'success', 500);
    } catch (err) {
      console.error(err);
      handleError(err);
      console.error("Error Handled");
      setLoading(false);
    }
  };

  const handleSubmitExcel = (values, actions) => {
    console.log('Excel Form Values:', values);
    actions.setSubmitting(false);
    // Handle Excel file upload
  };

  const validateUniqueUserIDs = (users) => {
    const userIDSet = new Set();
    const duplicates = new Set();
    users.forEach(user => {
        if (userIDSet.has(user['user-id'])) {
            duplicates.add(user['user-id']);
        }
        userIDSet.add(user['user-id']);
    });
    return duplicates;
  };
  
  const validateUniqueAssetIDs = (users) => {
    const assetIDSet = new Set();
    const duplicates = new Set();
    users.forEach(user => {
      user.assets.forEach(asset => {
        if (assetIDSet.has(asset['asset-id'])) {
          duplicates.add(asset['asset-id']);
        }
        assetIDSet.add(asset['asset-id']);
      });
    });
    console.log('Duplicate Assets');
    console.log(duplicates);
    return duplicates;
  };

  const validate = values => {
    // console.log('Running validation');
    const errors = {};
    // Implement validation logic
    const userIDDuplicates = validateUniqueUserIDs(values.users);
    const assetIDDuplicates = validateUniqueAssetIDs(values.users);

    if (userIDDuplicates.size > 0) {
      values.users.forEach((user, index) => {
        if (userIDDuplicates.has(user['user-id'])) {
          if (!errors.users) errors.users = [];
          errors.users[index] = { ...errors.users[index], 'user-id': 'User ID must be unique' };
        }
      });
    }

    if (assetIDDuplicates.size > 0) {
      values.users.forEach((user, userIndex) => {
        user.assets.forEach((asset, assetIndex) => {
          if (assetIDDuplicates.has(asset['asset-id'])) {
            if (!errors.users) errors.users = [];
            if (!errors.users[userIndex]) errors.users[userIndex] = {};
            if (!errors.users[userIndex].assets) errors.users[userIndex].assets = [];
            errors.users[userIndex].assets[assetIndex] = { 'asset-id': 'Asset ID must be unique' };
          }
        });
      });
    }
    // console.log(errors);

    return errors;
  };

  return (
    <div>
      <Toggle 
        label="Use Excel"
        check_fn={checkFn}
        uncheck_fn={uncheckFn}
      />

      {!isExcel ? (
        <Formik
          initialValues={initialValuesManual}
          onSubmit={handleSubmitManual}
          // validate={validate}
          // validateOnChange={true}
          // validateOnBlur={true}
        >
        {formikProps => (
          <Form>
            <ModalBody>
              <FieldArray name="users">
                {({ remove, push }) => (
                  <Box>
                    {formikProps.values.users.map((user, userIndex) => (
                      <Box key={userIndex}>
                        <Flex direction="column" gap={4}>
                          <SingleSelectFormControl 
                            name={`users.${userIndex}.user-id`}
                            onInputChange={handleUserInputChange}
                            label="User Name" 
                            options={users} 
                            placeholder="Select a user" 
                          />
                          <FieldArray name={`users.${userIndex}.assets`}>
                            {assetHelpers => (
                              <LoanSingleAsset 
                                user={user}
                                assetHelpers={assetHelpers} 
                                userIndex={userIndex}
                                options={options}
                                setOptions={setOptions}
                              />
                            )}
                          </FieldArray>
                          <FormToggle label="Bookmark User" name={`users.${userIndex}.bookmark-user`} />
                          {formikProps.values.users.length > 1 && (
                            <Button type="button" onClick={() => remove(userIndex)}>
                              Remove User
                            </Button>
                          )}
                          <FormikSignatureField
                            name={`users.${userIndex}.signature`}
                            label="Signature"
                          />
                        </Flex>
                      </Box>
                    ))}
                    <Button
                      type="button"
                      onClick={() => push(addNewUser())}
                    >
                      Add Another User
                    </Button>
                  </Box>
                )}
              </FieldArray>
              <DateInputControl label="Loaned Date" name={`loaned-date`} />
            </ModalBody>
            <ModalFooter>
            <Button variant="outline" onClick={() => {
              formikProps.resetForm()
              onModalClose()
            }}>
              Cancel
            </Button>
            <Button colorScheme="blue" type="submit">
              Submit
            </Button>
          </ModalFooter>
          </Form>
        )}
        </Formik>
      ) : (
        <Formik
          initialValues={initialValuesExcel}
          onSubmit={handleSubmitExcel}
        >
          <Form>
            <ModalBody>
              <ExcelFormControl />
            </ModalBody>
            <ModalFooter>
              <Button variant="outline" mr={3} onClick={onModalClose}>Cancel</Button>
              <Button colorScheme="blue" type="submit">Upload Excel</Button>
            </ModalFooter>
          </Form>
        </Formik>
      )}
    </div>
  );
};

export default LoanAsset;