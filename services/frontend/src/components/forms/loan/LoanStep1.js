import { Box, Button, Divider, Flex, ModalBody, ModalFooter, Spacer, VStack } from "@chakra-ui/react";
import ExcelFormControl from '../utils/ExcelFormControl';
import { useFormModal } from "../../../context/ModalProvider";
import { FieldArray, Form, Formik, useFormikContext } from "formik";
import assetService from "../../../services/AssetService";
import { useUI } from "../../../context/UIProvider";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { LoanType } from "./Loan";
import { LoanProvider } from "./LoanProvider";
import { useLoans } from "./LoansProvider";
import { setFieldError } from "../utils/validation";

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
    
    const validateUser = (user, userIDDuplicates) => {
      if (userIDDuplicates.has(user['userId'])) return 'Users must be unique for each loan';
      if (!user['userId'] && user['userName']) return `${user['userName']} is not found / ambiguous.`;
      if (!user['userId']) return 'User is Required';
      return null;
    };
    
    const validateAsset = (asset, assetIDDuplicates, mode, userCount) => {
      if (assetIDDuplicates.has(asset['assetId'])) return 'Asset must be unique for each loan';
      if (!asset['assetId'] && asset['assetTag']) return `${asset['assetTag']} is not found / is ambiguous`;
      if (!asset['assetId']) return 'Asset is Required';
      if (mode === LoanType.SINGLE && userCount > 1) return `${asset.assetTag} is not a shared asset.`;
      return null;
    };
    
    const validateAccessory = (accessory, accessoryIDDuplicates) => {
      if (accessoryIDDuplicates.has(accessory['accessoryTypeId'])) return 'Accessories must be unique'; // TODO maybe indicate with isNew on SelectFormControl
      if (!accessory['accessoryName']) return 'Accessory is Required';
      return null;
    };
    
    // Generate warnings based on new accessories
    const generateWarnings = (loans, newAccessories) => {
      return loans.reduce((acc, loan, loanIndex) => {
          loan.asset.accessories.forEach((accessory, accessoryIndex) => {
            if (newAccessories[accessory.accessoryName]) {
              setFieldError(acc, ['loans', loanIndex, 'accessories', accessoryIndex, 'accessoryName'], 
                `New accessory will be created (${newAccessories[accessory.accessoryName]}x found in this form)`);
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

        if (loan.expectedReturnDate && loan.expectedReturnDate < new Date()) {
          setFieldError(errors, ['loans', loanIndex, 'expectedReturnDate'], 'Only future dates allowed');
        }
  
        // Validate unique User IDs within each loan
        const userIDDuplicates = validateUniqueUserIDs(loan.users);
        loan.users.forEach((user, userIndex) => {
          const userError = validateUser(user, userIDDuplicates);
          if (userError) {
            setFieldError(errors, ['loans', loanIndex, 'users', userIndex, 'userName'], userError);
          }
        });
    
        // Validate unique Asset IDs across all loans
				const assetError = validateAsset(loan.asset, assetIDDuplicates, mode, loan.users.length);
				if (assetError) {
					setFieldError(errors, ['loans', loanIndex, 'asset', 'assetTag'], assetError);
				}
	
				// Validate unique Accessory IDs within each asset
				const accessoryIDDuplicates = validateUniqueAccessoryIDs(loan.asset.accessories);
				loan.asset.accessories.forEach((accessory, accessoryIndex) => {
					const accessoryError = validateAccessory(accessory, accessoryIDDuplicates);
					if (accessoryError) {
						setFieldError(errors, ['loans', loanIndex, 'asset', 'accessories', accessoryIndex, 'accessoryName'], accessoryError);
					}
					// Track new accessories for warnings
					if (accessory.id === '' && accessory.accessoryName) {
						newAccessories[accessory.accessoryName] = (newAccessories[accessory.accessoryName] || 0) + parseInt(accessory.count, 10);
					}
				});
      });

      console.log(errors);
    
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
                  <ExcelFormControl loadValues={setValuesExcel} templateCols={['assetTag', 'userNames', 'accessoryTypes', 'expectedReturnDate', 'remarks']}/>
                  <Divider borderColor="black" borderWidth="2px" my={2} />
                  <FieldArray name="loans">
                  {loanHelpers => (
                    values.loans.map((loan, loanIndex, array) => (
											// Change to single asset only
                      <LoanProvider
                        key={loan.key}
                        loan={loan}
                        loanIndex={loanIndex}
                        loanHelpers={loanHelpers}
                        warnings={warnings?.loans?.[loanIndex]}
                        isLast={loanIndex === array.length - 1}
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