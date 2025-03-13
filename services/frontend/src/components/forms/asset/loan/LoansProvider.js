import React, { createContext, useContext, useEffect, useState } from "react";
import { LoanStep2 } from "./LoanStep2";
import { LoanStep1 } from "./LoanStep1";
import { useUI } from "../../../../context/UIProvider";
import assetService from "../../../../services/AssetService";
import { createNewLoan, createNewUser } from "./LoanUser";
import { Box } from "@chakra-ui/react";
import { useFormModal } from "../../../../context/ModalProvider";
import { compareStrings, convertExcelDate } from "../../utils/validation";
import userService from "../../../../services/UserService";
import accessoryService from "../../../../services/AccessoryService";
import { useLoading } from "../../../../context/LoadingProvider";
import loanService from "../../../../services/LoanService";

// Create a context
const LoansContext = createContext();

// Create a provider component
export const LoansProvider = ({ children }) => {
  const { showToast, handleError } = useUI();
  const { setLoading } = useLoading();
  const { setFormType, initialValues } = useFormModal();
  const [ warnings, setWarnings ] = useState({});

  const [assetOptions, setAssetOptions] = useState([]);
  const [userOptions, setUserOptions] = useState([]);
  const [accessoryOptions, setAccessoryOptions] = useState([]);
  const [formData, setFormData] = useState({
    users: [createNewUser()],
    signatures: {},
  });
  const [userLoans, setUserLoans] = useState({});
  const [step, setStep] = useState(1);

  useEffect(() => {
    console.log(initialValues);
    if (!initialValues?.serialNumbers?.length || !initialValues?.userNames?.length) return;

    const fetchAstLoans = async () => {
      const assetResponse = await loanService.fetchAstLoan(initialValues.serialNumbers);
      setAssetOptions(assetResponse.data);

      const assetObjs = initialValues.serialNumbers.map(serialNumber => {
        const matchedAssetOption = assetResponse.data.find(assetOption => assetOption.serialNumber === serialNumber);
        if (!matchedAssetOption) return { serialNumber }
        else return matchedAssetOption;
      })
      if (initialValues.grouped) {
        const loans = assetObjs.map(asset => ({ asset }))
        setFormData({
          users: [createNewUser({ loans })]
        });
      } else {
        const users = assetObjs.map(asset => createNewUser({ loans: [createNewLoan({ asset })] }))
        setFormData({ users });
      }
    }

    const fetchUserLoans = async () => {
      const userResponse = await loanService.fetchUserLoan(initialValues.userNames);
      setUserOptions(userResponse.data);
      
      const userObjs = initialValues.userNames.map(userName => {
        const matchedUserOption = userResponse.data.find(userOption => userOption.userName === userName);
        if (!matchedUserOption) return { userName }
        else return matchedUserOption;
      })
      const users = userObjs.map(user => createNewUser(user));
      setFormData({ users });
    }

    if(initialValues.serialNumbers) {
      fetchAstLoans();
    } else if (initialValues.userNames) {
      fetchUserLoans();
    }
  }, [initialValues, setFormData]);

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

        // Trim and add asset tags to the set
        record.serialNumber = record.serialNumber?.trim();
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
      if (accessoryNames.size !== 0) {
        const accessoryResponse = await loanService.fetchAccLoan([...accessoryNames]);
        newAccessoryoptions = accessoryResponse.data;
      }

      setAssetOptions(newAssetOptions);
      setUserOptions(newUserOptions);
      setAccessoryOptions(newAccessoryoptions);
  
      // Convert grouped records into loans
      const users = Object.entries(userToRowMap).map(([userName, rowIdxs]) => {

        // Find the user IDs based on userNames (assuming userNames is an array of names)
        const matchedUserOption = newUserOptions.find(option => compareStrings(option.value, userName));
        console.log(matchedUserOption);
        const userObj = matchedUserOption || {userName};

        userObj.loans = []
        
        for (const rowIdx of rowIdxs) {
          const { serialNumber, accessoryTypes, expectedReturnDate, remarks } = records[rowIdx];

          const matchedAssetOption = newAssetOptions.find(option => compareStrings(option.value, serialNumber));
          console.log(matchedAssetOption);
          const assetObj = matchedAssetOption || {serialNumber: serialNumber}; // Pass serialNumber regardless of whether id is found

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
    
      setFormData({
        users: users.map(user => createNewUser(user))
      });
    } catch (error) {
      handleError(error);
    }
  };

  const prevStep = () => {
    setStep(step - 1)
  };

  const addNewAccessory = async (accessoryName) => {
    try {
      setLoading(true);
      const response = await accessoryService.createAccessory(accessoryName);
      setAccessoryOptions(oldArray => [
        ...oldArray.filter(item => !(item.value === accessoryName && !item.accessoryTypeId)),
        { 
          accessoryTypeId: response.data.newAccType.accessoryTypeId,
          accessoryName: response.data.newAccType.accessoryName,
          stock: response.data.newAccType.stock,
          value: response.data.newAccType.accessoryName,
          label: response.data.newAccType.accessoryName
        }
      ]);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      handleError(error);
    }
  }

  useEffect(() => {console.log(accessoryOptions)}, [accessoryOptions]);

  const nextStep = (values, actions) => {
    console.log('Manual Form Values:', values);
    setFormData(values);
    setStep(step + 1);
  };

  const handleSubmit = async (values, actions) => {
    setLoading(true);
    console.log('Manual Form Values:', values);
    try {
      await loanService.loanItems(values);
      actions.setSubmitting(false);
      setLoading(false);
      showToast('Assets successfully loaned', 'success', 500);
      setFormType(null);
    } catch (err) {
      console.error(err);
      handleError(err);
      console.error("Error Handled");
      setLoading(false);
    }
  };

  // The context value includes all the states and functions to be shared
  const value = {
    assetOptions,
    userOptions,
    accessoryOptions,
    formData,
    addNewAccessory,
    userLoans,
    step,
    setAssetOptions,
    setUserOptions,
    setAccessoryOptions,
    setFormData,
    setUserLoans,
    setStep,
    processAccessories,
    setValuesExcel,
    prevStep,
    nextStep,
    handleSubmit,
    warnings,
    setWarnings
  };

  return (
    <LoansContext.Provider value={value}>
      <Box style={{ display: step === 1 ? 'block' : 'none' }}>
        <LoanStep1/>
      </Box>
      <Box style={{ display: step === 2 ? 'block' : 'none' }}>
        <LoanStep2/>
      </Box>
    </LoansContext.Provider>
  )
};

// Hook to use the LoanContext in child components
export const useLoans = () => {
  return useContext(LoansContext);
};