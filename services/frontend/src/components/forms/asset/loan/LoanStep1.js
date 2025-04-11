import { Box, Button, Divider, Flex, ModalBody, ModalFooter, Spacer, VStack } from "@chakra-ui/react";
import ExcelFormControl from "../../utils/ExcelFormControl";
import { useFormModal } from "../../../../context/ModalProvider";
import { FieldArray, Form, Formik, useFormikContext } from "formik";
import assetService from "../../../../services/AssetService";
import { useUI } from "../../../../context/UIProvider";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { LoanType } from "./LoanUser";
import { LoanProvider } from "./LoanProvider";
import { useLoans } from "./LoansProvider";
import { setFieldError } from "../../utils/validation";

export const LoanStep1 = () => {

    const { nextStep, formData, setValuesExcel } = useLoans();
    const { setFormType, reinitializeForm } = useFormModal();
    const [ warnings, setWarnings ] = useState({});
    const formRef = useRef(null);
  
    useEffect(() => console.log('loan form rendered'))
		
    useEffect(() => console.log(formData), [formData]);

    useEffect(() => reinitializeForm(formRef, formData), [formData, reinitializeForm])
    
    const validateUniqueAssetIDs = (assets) => {
      const assetIDSet = new Set();
      const duplicates = new Set();
      assets.forEach(asset => {
				if (asset['assetId'] === '') return;
        if (assetIDSet.has(asset['assetId'])) {
          duplicates.add(asset['assetId']);
        }
        assetIDSet.add(asset['assetId']);
      });
      // console.log('Duplicate Assets');
      // console.log(duplicates);
      return duplicates;
    };
  
    const validateUniqueAccessoryIDs = (accessories) => {
      const accessoryIDSet = new Set();
      const duplicates = new Set();
      accessories.forEach(accessory => {
        if (accessory['accessoryTypeId'] === '') return;

        if (accessoryIDSet.has(accessory['accessoryTypeId'])) {
          duplicates.add(accessory['accessoryTypeId']);
        }
        accessoryIDSet.add(accessory['accessoryTypeId']);
      });
      // console.log('Duplicate Accessories');
      // console.log(duplicates);
      return duplicates;
    }
    
    const validateAsset = (asset, assetIDDuplicates) => {
      if (assetIDDuplicates.has(asset['assetId'])) return 'Asset must be unique for each loan';
      if (!asset['assetId'] && asset['serialNumber']) return `${asset['serialNumber']} is not found`;
      if (!asset['assetId']) return 'Asset is Required';
      if (asset['onLoan']) return `${asset['serialNumber']} is on loan`;
      return null;
    };
    
    const validateAccessory = (accessory, accessoryIDDuplicates) => {
      if (accessoryIDDuplicates.has(accessory['accessoryTypeId'])) return 'Accessories must be unique'; // TODO maybe indicate with isNew on SelectFormControl
      if (!accessory['accessoryName']) return 'Accessory is Required';
      return null;
    };

    const validate = values => {
			// console.log(formRef.current?.values);
      const errors = {};
  
      const assetIDDuplicates = validateUniqueAssetIDs(values.users.flatMap(user => user.loans.map(loan => loan.asset)));
      
      values.users.forEach((user, userIndex) => {

        if (user.userName === "") setFieldError(errors, ['users', userIndex, 'userName'], `User is required`)
        else if (user.userId === "") setFieldError(errors, ['users', userIndex, 'userName'], `User ${user.userName} not found`);

        user.loans.forEach((loan, loanIndex) => {
          // if (loan.expectedReturnDate && loan.expectedReturnDate < new Date()) {
          //   setFieldError(errors, ['loans', loanIndex, 'expectedReturnDate'], 'Only future dates allowed'); // TODO how to prevent return
          // }

          // Validate unique Asset IDs across all loans
          if (!loan.excludeAsset) {
            const assetError = validateAsset(loan.asset, assetIDDuplicates);
            if (assetError) {
              setFieldError(errors, ['users', userIndex, 'loans', loanIndex, 'asset', 'serialNumber'], assetError);
            }
          }

          if (!loan.expectedReturnDate) {
            setFieldError(errors, ['users', userIndex, 'loans', loanIndex, 'expectedReturnDate'], "Date cannot be empty");
          } else {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const returnDate = new Date(loan.expectedReturnDate);
            if (returnDate < today) {
              setFieldError(errors, ['users', userIndex, 'loans', loanIndex, 'expectedReturnDate'], "Date must be in the future");
            }
          }

          // Validate unique Accessory IDs within each asset
          const accessoryIDDuplicates = validateUniqueAccessoryIDs(loan.accessories);
          loan.accessories.forEach((accessory, accessoryIndex) => {
            const accessoryError = validateAccessory(accessory, accessoryIDDuplicates);
            if (accessoryError) {
              setFieldError(errors, ['users', userIndex, 'loans', loanIndex, 'accessories', accessoryIndex, 'accessoryName'], accessoryError);
            }
            // Track new accessories for warnings
            // if (accessory.id === '' && accessory.accessoryName) {
            //   newAccessories[accessory.accessoryName] = (newAccessories[accessory.accessoryName] || 0) + parseInt(accessory.count, 10);
            // }
            console.log(accessory);
            if (accessory['accessoryName'] && !accessory['accessoryTypeId']) setFieldError(errors, ['users', userIndex, 'loans', loanIndex, 'accessories', accessoryIndex, 'accessoryName'], `Please create new accessory type ${accessory['accessoryName']}`);
          });
        })
      });

      console.log(errors);
    
      // Set warnings based on new accessories
      // const updatedWarnings = generateWarnings(values.users.flatMap(user => user.loans.flatMap(loan => loan.accessories)), newAccessories);
      // console.log(updatedWarnings);
      // setWarnings(updatedWarnings);
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
                  <ExcelFormControl loadValues={setValuesExcel} templateCols={['serialNumber', 'userName', 'accessoryTypes', 'expectedReturnDate', 'remarks']}/>
                  <Divider borderColor="black" borderWidth="2px" my={2} />
                  <FieldArray name="users">
                  {loanHelpers => (
                    values.users.map((user, userIndex, array) => (
											// Change to single asset only
                      <LoanProvider
                        key={user.key}
                        user={user}
                        userIndex={userIndex}
                        userHelpers={loanHelpers}
                        warnings={warnings}
                        isLast={userIndex === array.length - 1}
                      >
                      </LoanProvider>
                    ))
                  )}
                  </FieldArray>
                </ModalBody>
                <ModalFooter>
                  <Button variant="outline" onClick={() => setFormType(null)}>Cancel</Button>
                  <Button colorScheme="blue" type="submit" isDisabled={errors.loans}>Next</Button>
                </ModalFooter>
              </Form>
            );
          }}
        </Formik>
      </Box>
    );
  };