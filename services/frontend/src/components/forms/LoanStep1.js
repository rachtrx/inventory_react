import { Box, Button, Divider, Flex, ModalBody, ModalFooter, Spacer, VStack } from "@chakra-ui/react";
import ExcelFormControl from './utils/ExcelFormControl';
import DateInputControl from "./utils/DateInputControl";
import { useFormModal } from "../../context/ModalProvider";
import { FieldArray, Form, Formik, useFormikContext } from "formik";
import assetService from "../../services/AssetService";
import { useUI } from "../../context/UIProvider";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { createNewLoan, LoanType } from "./Loan";
import { LoanProvider } from "../../context/LoanProvider";
import { createNewPeripheral } from "./LoanAsset";

export const LoanStep1 = ({ nextStep, formData }) => {

    const { setFormType } = useFormModal();
    const { setLoading, showToast, handleError } = useUI();
    const [ warnings, setWarnings ] = useState({});
    const formRef = useRef(null);
  
    console.log('loan form rendered');
		console.log(formData);
  
    const reinitializeForm = (newValues) => {
      if (formRef.current) {
        formRef.current.setTouched({});
        formRef.current.setValues(newValues);
        formRef.current.validateForm();
      }
    };

		const processPeripherals = (peripheralsString) => {
			if (!peripheralsString) return {};
		
			return peripheralsString
				.split(',')
				.map(peripheral => peripheral.trim())
				.reduce((acc, peripheral) => {
					if (acc[peripheral]) {
						acc[peripheral] += 1;
					} else {
						acc[peripheral] = 1;
					}
					return acc;
				}, {});
		};
  
    const setValuesExcel = (records) => {
      try {
        const groupedRecords = records.reduce((acc, record) => {
					const assetTag = record.assetTag?.trim();
					if (acc[assetTag]) {
						throw new Error(`Duplicate records for assetTag: ${assetTag} were found`);
					}

					const peripherals = processPeripherals(record.peripherals);
				
					acc[assetTag] = {
						userNames: record.userNames
							? [...new Set(record.userNames.split(',').map(user => user.trim()))]
							: [],
						peripherals: Object.entries(peripherals).map(([name, count]) => ({peripheralName: name, count: count}))
					};
				
					return acc;
				}, {});
      
        // Convert grouped records into loans
        const loans = Object.entries(groupedRecords).map(([assetTag, { userNames, peripherals }]) =>
          createNewLoan(
            assetTag,
            userNames,
            peripherals,
          )
        );
      
        console.log(loans);
      
        reinitializeForm({
          loans: loans
        });
      } catch (error) {
        handleError(error);
      }
    };
    
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
      // console.log('Duplicate Peripherals');
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
    
    const validatePeripheral = (peripheral, peripheralIDDuplicates) => {
      if (peripheralIDDuplicates.has(peripheral['id'])) return 'Peripherals must be unique';
      if (!peripheral['id']) return 'Peripheral is Required';
      return null;
    };
    
    // Generate warnings based on new peripherals
    const generateWarnings = (loans, newPeripherals) => {
      return loans.reduce((acc, loan, loanIndex) => {
          loan.asset.peripherals.forEach((peripheral, peripheralIndex) => {
            if (newPeripherals[peripheral.id]) {
              setFieldError(acc, ['loans', loanIndex, 'peripherals', peripheralIndex, 'id'], 
                `New peripheral will be created (${newPeripherals[peripheral.id]}x found in this form)`);
            }
          });
        return acc;
      }, {});
    };
  
    const validate = values => {
			// console.log(formRef.current?.values);
      const errors = {};
      const newPeripherals = {};
  
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
	
				// Validate unique Peripheral IDs within each asset
				const peripheralIDDuplicates = validateUniquePeripheralIDs(loan.asset.peripherals);
				loan.asset.peripherals.forEach((peripheral, peripheralIndex) => {
					const peripheralError = validatePeripheral(peripheral, peripheralIDDuplicates);
					if (peripheralError) {
						setFieldError(errors, ['loans', loanIndex, 'asset', 'peripherals', peripheralIndex, 'id'], peripheralError);
					}
					// Track new peripherals for warnings
					if (peripheral.id !== '' && (peripheral.id === peripheral.peripheralName)) {
						newPeripherals[peripheral.id] = (newPeripherals[peripheral.id] || 0) + parseInt(peripheral.count, 10);
					}
				});
      });
    
      // Set warnings based on new peripherals
      const updatedWarnings = generateWarnings(values.loans, newPeripherals);
      // console.log(updatedWarnings);
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
                  <ExcelFormControl loadValues={setValuesExcel} templateCols={['assetTag', 'userNames', 'peripherals']}/>
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