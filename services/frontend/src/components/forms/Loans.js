import { Box, Button, Divider, Flex, ModalBody, ModalFooter, Spacer, VStack } from "@chakra-ui/react";
import ExcelFormControl from './utils/ExcelFormControl';
import DateInputControl from "./utils/DateInputControl";
import { useFormModal } from "../../context/ModalProvider";
import { FieldArray, Form, Formik, useFormikContext } from "formik";
import assetService from "../../services/AssetService";
import { useUI } from "../../context/UIProvider";
import React, { useCallback, useEffect, useRef } from "react";
import { createNewLoan, Loan } from "./Loan";
import { LoanProvider } from "../../context/LoanProvider";

const Loans = () => {

  console.log('loan form rendered');
  const { setFormType } = useFormModal();
  const { setLoading, showToast, handleError } = useUI();
  const formRef = useRef(null);

  useEffect(() => {
    if (formRef.current) {
      formRef.current.validateForm()
    }
  }, [])

  const initialValuesManual = {
    loans: [createNewLoan()],
    'loanDate': new Date(),
    'expectedReturnDate': null
  };

  console.log(initialValuesManual);

  const loadExcelValues = (records, setFieldValue) => {
    records.forEach((record, recordIndex) => {
      setFieldValue(`loans.${recordIndex}.assets.${0}.assetId`, record.assetTag?.trim());
      setFieldValue(`loans.${recordIndex}.users.${0}.userId`, record.userName?.trim());
    })
  }

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
  
  const validateUniqueAssetIDs = (loans) => {
    const assetIDSet = new Set();
    const duplicates = new Set();
    loans.forEach(loan => {
      loan.assets.forEach(asset => {
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
    console.log('Duplicate Users');
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
  
    // Validate unique Asset IDs across all loans
    const assetIDDuplicates = validateUniqueAssetIDs(values.loans);
  
    values.loans.forEach((loan, loanIndex) => {
      // Validate unique User IDs within each loan
      const userIDDuplicates = validateUniqueUserIDs(loan.users);
  
      loan.users.forEach((user, userIndex) => {
        let error = null;
        if (userIDDuplicates.has(user['userId'])) error = 'Users must be unique for each loan'
        if (!user['userId']) error = 'User is Required'
        if (error) {
          errors.loans = errors.loans || [];
          errors.loans[loanIndex] = errors.loans[loanIndex] || {};
          errors.loans[loanIndex].users = errors.loans[loanIndex].users || [];
          errors.loans[loanIndex].users[userIndex] = { 'userId': error };
        }
      });
  
      loan.assets.forEach((asset, assetIndex) => {
        let error = null;
        if (assetIDDuplicates.has(asset['assetId'])) error = 'Asset must be unique for each loan'
        if (!asset['assetId']) error = 'Asset is Required'
        if (error) {
          errors.loans = errors.loans || [];
          errors.loans[loanIndex] = errors.loans[loanIndex] || {};
          errors.loans[loanIndex].assets = errors.loans[loanIndex].assets || [];
          errors.loans[loanIndex].assets[assetIndex] = { 'assetId': error };
        }
  
        // Validate unique Peripheral IDs within each asset
        const peripheralIDDuplicates = validateUniquePeripheralIDs(asset.peripherals);
  
        asset.peripherals.forEach((peripheral, peripheralIndex) => {
          let error = null;
          if (peripheralIDDuplicates.has(peripheral['id'])) error = 'Peripherals must be unique';
          if (!peripheral['id']) error = 'Peripheral is Required'

          if (error) {
            errors.loans = errors.loans || [];
            errors.loans[loanIndex] = errors.loans[loanIndex] || {};
            errors.loans[loanIndex].assets = errors.loans[loanIndex].assets || [];
            errors.loans[loanIndex].assets[assetIndex] = errors.loans[loanIndex].assets[assetIndex] || {};
            errors.loans[loanIndex].assets[assetIndex].peripherals = errors.loans[loanIndex].assets[assetIndex].peripherals || [];
            errors.loans[loanIndex].assets[assetIndex].peripherals[peripheralIndex] = {
              ...errors.loans[loanIndex].assets[assetIndex].peripherals[peripheralIndex],
              'id': error,
            };
          }
        });
      });
    });
  
    console.log(errors); // Remove this in production if not needed
    return errors;
  };

  return (
    <Box>
      <Formik
        initialValues={initialValuesManual}
        onSubmit={handleSubmitManual}
        validate={validate}
        validateOnChange={true}
        validateOnBlur={true}
        innerRef={formRef}
      >
        {({ values, errors }) => {

          return (
            <Form>
              <ModalBody>
                <ExcelFormControl loadValues={loadExcelValues} templateCols={['assetTag', 'userName']}/>
                <Divider borderColor="black" borderWidth="2px" my={2} />
                <FieldArray name="loans">
                {loanHelpers => (
                  values.loans.map((loan, loanIndex, array) => (
                    <LoanProvider key={loan.key} loan={loan} loanIndex={loanIndex} loanHelpers={loanHelpers} errors={errors.loans?.[loanIndex]} loanCount={array.length}>
                      <Loan/>
                    </LoanProvider>
                  ))
                )}
                </FieldArray>
                <Flex>
                  <DateInputControl label="Loaned Date" name={`loanDate`} />
                  <DateInputControl label="Expected Return Date" name={`expectedReturnDate`} />
                </Flex>
              </ModalBody>
              <ModalFooter>
                <Button variant="outline" onClick={() => setFormType(null)}>Cancel</Button>
                <Button colorScheme="blue" type="submit" isDisabled={errors.loans}>Submit</Button>
              </ModalFooter>
            </Form>
          );
        }}
      </Formik>
    </Box>
  );
};

export default Loans;