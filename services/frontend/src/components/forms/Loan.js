import { Box, Button, Divider, Flex, ModalBody, ModalFooter } from "@chakra-ui/react";
import ExcelFormControl from './utils/ExcelFormControl';
import DateInputControl from "./utils/DateInputControl";
import FormToggle from "./utils/FormToggle";
import { useFormModal } from "../../context/ModalProvider";
import { SearchFormControl, SingleSelectFormControl } from "./utils/SelectFormControl";
import { FieldArray, Form, Formik } from "formik";
import assetService from "../../services/AssetService";
import { useUI } from "../../context/UIProvider";
import { LoanAssetsArray } from "./LoanAssetsArray";
import { FormikSignatureField } from "./utils/SignatureField";
import { ResponsiveText } from "../utils/ResponsiveText";
import { createNewAsset } from "./LoanAssetsArray";
import { v4 as uuidv4 } from 'uuid';

const createNewUser = () => ({
  'key': uuidv4(),
  'userId': '',
  'assets': [createNewAsset()],
  'bookmarked': false,
  'signature': ''
})

const Loan = () => {

  console.log('loan form rendered');

  const { isExcel, handleUserSearch, onModalClose } = useFormModal();
  const { setLoading, showToast, handleError } = useUI();

  const initialValuesManual = {
    users: [createNewUser()],
    'loanDate': new Date(),
    'expectedReturnDate': null
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
      if (user['userId'] === '') return;
        if (userIDSet.has(user['userId'])) {
            duplicates.add(user['userId']);
        }
        userIDSet.add(user['userId']);
    });
    return duplicates;
  };
  
  const validateUniqueAssetIDs = (users) => {
    const assetIDSet = new Set();
    const duplicates = new Set();
    users.forEach(user => {
      user.assets.forEach(asset => {
        if (asset['assetId'] === '') return;
        if (assetIDSet.has(asset['assetId'])) {
          duplicates.add(asset['assetId']);
        }
        assetIDSet.add(asset['assetId']);
      });
    });
    console.log('Duplicate Assets');
    console.log(duplicates);
    return duplicates;
  };

  const validateUniquePeripheralIDs = (peripherals) => {
    const peripheralIDSet = new Set();
    const duplicates = new Set();
    peripherals.forEach(peripheral => {
      if (peripheral['id'] === '') return;
        if (peripheralIDSet.has(peripheral['id'])) {
          duplicates.add(peripheral['id']);
        }
        peripheralIDSet.add(peripheral['id']);
    });
    console.log('Duplicate Peripherals');
    console.log(duplicates);
    return duplicates;
  }

  const validate = values => {

    const errors = {};
    // Implement validation logic
    const userIDDuplicates = validateUniqueUserIDs(values.users);
    const assetIDDuplicates = validateUniqueAssetIDs(values.users);

    values.users.forEach((user, userIndex) => {
      let userErr = null
      console.log(user);
      if (user['userId'] === '') userErr = 'User cannot be blank'
      if (userIDDuplicates.size > 0 && userIDDuplicates.has(user['userId'])) userErr = 'User must be unique'

      if (userErr) {
        if (!errors.users) errors.users = [];
        errors.users[userIndex] = { ...errors.users[userIndex], 'userId': userErr };
      }

      user.assets.forEach((asset, assetIndex) => {
        if (assetIDDuplicates.size > 0 && assetIDDuplicates.has(asset['assetId'])) {
          if (!errors.users) errors.users = [];
          if (!errors.users[userIndex]) errors.users[userIndex] = {};
          if (!errors.users[userIndex].assets) errors.users[userIndex].assets = [];
          errors.users[userIndex].assets[assetIndex] = { 'assetId': 'Asset ID must be unique' };
        }

        const peripheralIDDuplicates = validateUniquePeripheralIDs(asset.peripherals)

        console.log(asset);

        asset.peripherals.forEach((peripheral, peripheralIndex) => {
          console.log(peripheral);
          if (peripheralIDDuplicates.size > 0 && peripheralIDDuplicates.has(peripheral['id'])) {
            if (!errors.users) errors.users = [];
            if (!errors.users[userIndex]) errors.users[userIndex] = {};
            if (!errors.users[userIndex].assets) errors.users[userIndex].assets = [];
            if (!errors.users[userIndex].assets[assetIndex]) errors.users[userIndex].assets[assetIndex] = {};
            if (!errors.users[userIndex].assets[assetIndex].peripherals) errors.users[userIndex].assets[assetIndex].peripherals = [];
            errors.users[userIndex].assets[assetIndex].peripherals[peripheralIndex] = { ...errors.users[userIndex].assets[assetIndex].peripherals[peripheralIndex], 'id': 'Peripherals must be unique' };
          }         
        })
      });
    });
    // console.log(errors);
    
    return errors;
  };

  return (
    <Box>
      {!isExcel ? (
        <Formik
          initialValues={initialValuesManual}
          onSubmit={handleSubmitManual}
          validate={validate}
          validateOnChange={true}
          validateOnBlur={true}
        >
        {({values, resetForm}) => {
          return (
          <Form>
            <ModalBody>
            <Divider borderColor="black" borderWidth="2px" my={2} />
              <FieldArray name="users">
                {({ remove, push }) => (
                  <Box>
                    {values.users.map((user, userIndex, array) => (
                      <Box key={user.key}>
                        <Flex direction="column" gap={4}>
                          <SearchFormControl 
                            name={`users.${userIndex}.userId`}
                            searchFn={handleUserSearch}
                            label={`User #${userIndex + 1}`} 
                            placeholder="Select a user"
                          />
                          <LoanAssetsArray 
                            fieldArrayName={`users.${userIndex}.assets`}
                            assets={user.assets}
                          />
                          <FormikSignatureField
                            name={`users.${userIndex}.signature`}
                            label="Signature"
                          />
                          <FormToggle label="Bookmark User" name={`users.${userIndex}.bookmarked`} />
                          <Flex justifyContent="flex-start" gap={4}>
                            {values.users.length > 1 && (
                              <Button type="button" onClick={() => remove(userIndex)} alignSelf='flex-start'>
                                <ResponsiveText>Remove User</ResponsiveText>
                              </Button>
                            )}
                            {userIndex === array.length - 1 && (
                              <Button
                                type="button"
                                onClick={() => push(createNewUser())}
                              >
                                <ResponsiveText>Add Another User</ResponsiveText>
                              </Button>
                            )}
                          </Flex>
                        </Flex>
                        <Divider borderColor="black" borderWidth="2px" my={4} />
                      </Box>
                    ))}
                  </Box>
                )}
              </FieldArray>
              <Flex>
                <DateInputControl label="Loaned Date" name={`loanDate`} />
                <DateInputControl label="Expected Return Date" name={`expectedReturnDate`} />
              </Flex>
            </ModalBody>
            <ModalFooter>
            <Button variant="outline" onClick={() => {
              resetForm()
              onModalClose()
            }}>
              Cancel
            </Button>
            <Button colorScheme="blue" type="submit">
              Submit
            </Button>
          </ModalFooter>
          </Form>
        )}}
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
    </Box>
  );
};

export default Loan;