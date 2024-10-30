import { Box, Button, Divider, Flex, ModalBody, ModalFooter, Spacer, VStack } from "@chakra-ui/react";
import ExcelFormControl from '../utils/ExcelFormControl';
import DateInputControl from "../utils/DateInputControl";
import { useFormModal } from "../../../context/ModalProvider";
import { FieldArray, Form, Formik, useFormikContext } from "formik";
import assetService from "../../../services/AssetService";
import { useUI } from "../../../context/UIProvider";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { createNewLoan, Loan, LoanType } from "./Loan";
import { LoanProvider } from "./LoanProvider";
import { createNewAccessory } from "./LoanAsset";
import { useLoans } from "./LoansProvider";

export const LoanStep1 = () => {

    const { nextStep, formData, setValuesExcel } = useLoans();
    const { setFormType, reinitializeForm } = useFormModal();
    const { setLoading, showToast, handleError } = useUI();
    const [ warnings, setWarnings ] = useState({});
    const formRef = useRef(null);
  
    console.log('loan form rendered');
		console.log(formData);

    useEffect(() => reinitializeForm(formRef, formData), [formData, reinitializeForm])
    
    const validateUniqueAssetIDs = (loans) => {
      const assetIDSet = new Set();
      const duplicates = new Set();
      loans.forEach(loan => {
				if (loan.asset['assetId'] === '') return;
				if (assetIDSet.has(loan.asset['assetId'])) {
					duplicates.add(loan.asset['assetId']);
				}
				assetIDSet.add(loan.asset['assetId']);
      });
      // console.log('Duplicate Assets');
      // console.log(duplicates);
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
      // console.log('Duplicate Users');
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
  
    // Helper function to set field error in a nested object
    const setFieldError = (obj, path, error) => {
      path.reduce((acc, key, index) => {
        if (index === path.length - 1) {
          acc[key] = error;
        } else {
          acc[key] = acc[key] || {};
        }
        return acc[key];
      }, obj);
    };
    
    const validateUser = (user, userIDDuplicates) => {
      if (userIDDuplicates.has(user['userId'])) return 'Users must be unique for each loan';
      if (!user['userId']) return 'User is Required';
      if (user['userId'] === '' && user['userName'] !== user['userId']) return `${user['userName']} is not found / ambiguous.`;
      return null;
    };
    
    const validateAsset = (asset, assetIDDuplicates, mode, userCount) => {
      if (assetIDDuplicates.has(asset['assetId'])) return 'Asset must be unique for each loan';
      if (!asset['assetId']) return 'Asset is Required';
      if (mode === LoanType.SINGLE && userCount > 1) return `${asset.assetTag} is not a shared asset.`;
      if (asset['assetId'] === '' && asset['assetTag'] !== asset['assetId']) return `${asset['assetTag']} is not found / ambiguous.`;
      return null;
    };
    
    const validateAccessory = (accessory, accessoryIDDuplicates) => {
      if (accessoryIDDuplicates.has(accessory['accessoryTypeId'])) return 'Accessories must be unique';
      if (!accessory['accessoryTypeId']) return 'Accessory is Required';
      return null;
    };
    
    // Generate warnings based on new accessories
    const generateWarnings = (loans, newAccessories) => {
      return loans.reduce((acc, loan, loanIndex) => {
          loan.asset.accessories.forEach((accessory, accessoryIndex) => {
            if (newAccessories[accessory.id]) {
              setFieldError(acc, ['loans', loanIndex, 'accessories', accessoryIndex, 'accessoryTypeId'], 
                `New accessory will be created (${newAccessories[accessory.id]}x found in this form)`);
            }
          });
        return acc;
      }, {});
    };
  
    const validate = values => {
			// console.log(formRef.current?.values);
      const errors = {};
      const newAccessories = {};
  
      const assetIDDuplicates = validateUniqueAssetIDs(values.loans);
      
      values.loans.forEach((loan, loanIndex) => {
        const mode = loan.mode;
  
        // Validate unique User IDs within each loan
        const userIDDuplicates = validateUniqueUserIDs(loan.users);
        loan.users.forEach((user, userIndex) => {
          const userError = validateUser(user, userIDDuplicates);
          if (userError) {
            setFieldError(errors, ['loans', loanIndex, 'users', userIndex, 'userId'], userError);
          }
        });
    
        // Validate unique Asset IDs across all loans
				const assetError = validateAsset(loan.asset, assetIDDuplicates, mode, loan.users.length);
				if (assetError) {
					setFieldError(errors, ['loans', loanIndex, 'asset', 'assetId'], assetError);
				}
	
				// Validate unique Accessory IDs within each asset
				const accessoryIDDuplicates = validateUniqueAccessoryIDs(loan.asset.accessories);
				loan.asset.accessories.forEach((accessory, accessoryIndex) => {
					const accessoryError = validateAccessory(accessory, accessoryIDDuplicates);
					if (accessoryError) {
						setFieldError(errors, ['loans', loanIndex, 'asset', 'accessories', accessoryIndex, 'accessoryTypeId'], accessoryError);
					}
					// Track new accessories for warnings
					if (accessory.id !== '' && (accessory.id !== accessory.accessoryName)) {
						newAccessories[accessory.id] = (newAccessories[accessory.id] || 0) + parseInt(accessory.count, 10);
					}
				});
      });
    
      // Set warnings based on new accessories
      const updatedWarnings = generateWarnings(values.loans, newAccessories);
      console.log(updatedWarnings);
      setWarnings(updatedWarnings);
    
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
                  <ExcelFormControl loadValues={setValuesExcel} templateCols={['assetTag', 'userNames', 'accessoryTypes']}/>
                  <Divider borderColor="black" borderWidth="2px" my={2} />
                  <FieldArray name="loans">
                  {loanHelpers => (
                    values.loans.map((loan, loanIndex, array) => (
											// Change to single asset only
                      <Loan
                        key={loan.key}
                        loan={loan}
                        loanIndex={loanIndex}
                        loanHelpers={loanHelpers}
                        warnings={warnings?.loans?.[loanIndex]}
                        isLast={loanIndex === array.length - 1}
                      >
                      </Loan>
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