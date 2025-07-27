import { Box, Button, Divider, ModalBody, ModalFooter } from "@chakra-ui/react";
import ExcelFormControl from "../utils/ExcelFormControl";
import { useForm } from "../../../context/FormProvider";
import { FieldArray, Form, Formik } from "formik";
import { useEffect, useMemo } from "react";
import { LoanProvider } from "./LoanProvider";
import { useLoans } from "./LoansProvider";
import { compareStrings, convertExcelDate, setFieldError } from "../utils/validation";
import { useUI } from "../../../context/UIProvider";
import loanService from "../../../services/LoanService";
import { useStep } from "../../../context/StepProvider";
import { createNewAccessory, createNewAsset, createNewUser } from "./helpers";
import { useLocation } from "react-router-dom";

export const LoanStep1 = () => {
  
    const { nextStep, formData } = useStep();
    const { setAssetOptions, setUserOptions, setAccessoryOptions } = useLoans();
    const { setFormType, formRef, reinitializeForm } = useForm();
    const { handleError } = useUI();
  
    useEffect(() => console.log('loan form rendered'))
		
    useEffect(() => console.log(formData), [formData]);

    const location = useLocation();
    const initialUser = useMemo(() => {
      if (location.pathname.includes('assets')) {
        return createNewUser({loans: [{ asset: createNewAsset(), accessories: [] }]});
      } else if (location.pathname.includes('accessories')) {
        return createNewUser({loans: [{ asset: null, accessories: [createNewAccessory()] }]});
      } else {
        return createNewUser();
      }
    }, [location.pathname]);
    
    const initialFormValues = {
      users: [initialUser]
    };

    const processAccessories = (accessoryTypesStr) => {
      if (!accessoryTypesStr) return {};
      return accessoryTypesStr.split(',').map(accessoryType => accessoryType.trim()).reduce((acc, accessoryType) => {
        if (acc[accessoryType]) {
          acc[accessoryType] += 1;
        } else {
          acc[accessoryType] = 1;
        }
        return acc;
      }, {});
    };

    const setValuesExcel = async (records) => {
      // CANNOT SEARCH FOR ASSET HERE, MAYBE CAN TRY IN FUTURE TO GET THE UPDATED VALUE
      try {
        const serialNumbers = new Set();
        const userNames = new Set();
        const accessoryNames = new Set();

        const userToRowMap = {};

        records.forEach((record, idx) => {
          // Process and add user names to the set
          if (!record.userName) throw new Error (`Username required at line ${record.__rowNum__}`)
          record.userName = record.userName.trim();
          userNames.add(record.userName);

          if (!record.serialNumber) throw new Error (`Serial Number required at line ${record.__rowNum__}`)

          if (typeof record.serialNumber === 'number') {
            record.serialNumber = record.serialNumber.toString();
          }
          record.serialNumber = record.serialNumber.trim();
          if (record.serialNumber) {
              if (serialNumbers.has(record.serialNumber)) throw new Error(`Duplicate records for serialNumber: ${record.serialNumber} were found`);
              else serialNumbers.add(record.serialNumber);
          } else throw new Error (`Serial Number required at line ${record.__rowNum__}`)
      
          // Process accessoryTypes
          const accessoryTypes = processAccessories(record.accessoryTypes);
          record.accessoryTypes = Object.entries(accessoryTypes).map(([name, count]) => {
              accessoryNames.add(name);
              return { accessoryName: name, count: count };
          });
          
          if (record.expectedReturnDate) {
            record.expectedReturnDate = convertExcelDate(record.expectedReturnDate);
          }

          if (!userToRowMap[record.userName]) userToRowMap[record.userName] = [idx];
          else userToRowMap[record.userName].push(idx);
        });

        const assetResponse = await loanService.fetchAstLoan([...serialNumbers]);
        console.log(assetResponse.data);
        const userResponse = await loanService.fetchUserLoan([...userNames]);
        const newAssetOptions = assetResponse.data;
        const newUserOptions = userResponse.data;

        let newAccessoryoptions = [];
        console.log(accessoryNames);
        if (accessoryNames.size !== 0) {
          const accessoryResponse = await loanService.fetchAccLoan([...accessoryNames]);
          newAccessoryoptions = accessoryResponse.data;
          console.log(newAccessoryoptions);
        }
    
        // Convert grouped records into loans
        const users = Object.entries(userToRowMap).map(([userName, rowIdxs]) => {

          // Find the user IDs based on userNames (assuming userNames is an array of names)
          const matchedUserOption = newUserOptions.find(option => compareStrings(option.value, userName));
          console.log(matchedUserOption);
          let userObj;
          if (!matchedUserOption || matchedUserOption.isDisabled) userObj = {userName}
          else userObj = matchedUserOption;

          userObj.loans = []
          
          for (const rowIdx of rowIdxs) {
            const { serialNumber, accessoryTypes, expectedReturnDate, location, remarks } = records[rowIdx];

            const matchedAssetOption = newAssetOptions.find(option => compareStrings(option.value, serialNumber));
            console.log(matchedAssetOption);
            
            let assetObj;
            
            if (!matchedAssetOption || matchedAssetOption.isDisabled) assetObj = {serialNumber: serialNumber}
            else assetObj = matchedAssetOption; // Pass serialNumber regardless of whether id is found
            assetObj.location = location || "";

            const accessoryObjs = accessoryTypes.map(({accessoryName, count}) => {
              const matchedAccessoryOption = newAccessoryoptions.find(option => compareStrings(option.value, accessoryName));
              return matchedAccessoryOption || {
                accessoryName, // Pass accessoryName regardless of whether id is found
                count: count
              }
            });
            console.log(accessoryObjs);

            userObj.loans.push({
              asset: assetObj,
              accessories: accessoryObjs,
              expectedReturnDate: expectedReturnDate,
              remarks: remarks
            })
          }
          return userObj;
        })

        setAssetOptions(newAssetOptions.filter(option => !option.isDisabled));
        setUserOptions(newUserOptions.filter(option => !option.isDisabled));
        setAccessoryOptions(newAccessoryoptions);
      
        reinitializeForm({
          users: users.map(user => createNewUser(user))
        });
      } catch (error) {
        handleError(error);
      }
    };
        
    const validateUniqueAssetIDs = (assets) => {
      const assetIDSet = new Set();
      const duplicates = new Set();
      assets.forEach(asset => {
				if (!asset || asset['assetId'] === '') return;
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
          if (!loan.valid) {
            setFieldError(errors, ['users', userIndex, 'loans', loanIndex, 'valid'], "Include at least 1 item to loan");
          }
          
          if (loan.asset) {
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
            console.log(accessory);
            if (accessory['accessoryName'] && !accessory['accessoryTypeId']) setFieldError(errors, ['users', userIndex, 'loans', loanIndex, 'accessories', accessoryIndex, 'accessoryName'], `Please create new accessory type ${accessory['accessoryName']}`);
          });
        })
      });
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
                  <ExcelFormControl loadValues={setValuesExcel} templateCols={['serialNumber', 'userName', 'accessoryTypes', 'expectedReturnDate', 'location', 'remarks']}/>
                  <Divider borderColor="black" borderWidth="2px" my={2} />
                  <FieldArray name="users">
                  {loanHelpers => (
                    values.users.map((user, userIndex, array) => (
											// Change to single asset only
                      <LoanProvider
                        key={user?.key}
                        user={user}
                        userIndex={userIndex}
                        userHelpers={loanHelpers}
                        isLast={userIndex === array.length - 1}
                      >
                      </LoanProvider>
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