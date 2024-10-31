import React, { createContext, useContext, useEffect, useState } from "react";
import { LoanStep2 } from "./LoanStep2";
import { LoanStep1 } from "./LoanStep1";
import { useUI } from "../../../context/UIProvider";
import assetService from "../../../services/AssetService";
import { createNewLoan } from "./Loan";
import { Box } from "@chakra-ui/react";
import { useFormModal } from "../../../context/ModalProvider";

// Create a context
const LoansContext = createContext();

// Create a provider component
export const LoansProvider = ({ children }) => {
  const { setLoading, showToast, handleError } = useUI();
  const { setFormType, initialValues, handleAssetSearch, handleUserSearch, handleAccessorySearch } = useFormModal();
  const [ warnings, setWarnings ] = useState({});

  const [assetOptions, setAssetOptions] = useState([]);
  const [userOptions, setUserOptions] = useState([]);
  const [accessoryOptions, setAccessoryOptions] = useState([]);
  const [formData, setFormData] = useState({
    loans: [createNewLoan()],
    signatures: {},
  });
  const [userLoans, setUserLoans] = useState({});
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (initialValues) {
      console.log(initialValues);
      let asset = null;
      if(initialValues.assetId) {
        asset = initialValues;
        setAssetOptions([{value: initialValues.assetTag, label: initialValues.assetTag, assetId: initialValues.assetId}])
      }
      
      const users = []
      if(initialValues.userId) {
        users.push(initialValues)
        setUserOptions([{value: initialValues.userName, label: initialValues.userName, userId: initialValues.userId}])
      }
      
      setFormData({
        loans: [createNewLoan(asset, users)],
        signatures: {},
      });
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

        const assetTags = new Set();
        const userNames = new Set();
        const accessoryNames = new Set();

        records.forEach(record => {
            // Trim and add asset tags to the set
            record.assetTag = record.assetTag?.trim();
            if (record.assetTag) {
                if (assetTags.has(record.assetTag)) throw new Error(`Duplicate records for assetTag: ${record.assetTag} were found`);
                else assetTags.add(record.assetTag);
            } 
            
            // Process and add user names to the set
            record.userNames = record.userNames 
                ? [...new Set(record.userNames.split(',').map(user => {
                    const trimmedUser = user.trim();
                    userNames.add(trimmedUser); // Add each user to the userNames set
                    return trimmedUser;
                }))]
                : [];
        
            // Process accessoryTypes
            const accessoryTypes = processAccessories(record.accessoryTypes);
            record.accessoryTypes = Object.entries(accessoryTypes).map(([name, count]) => {
                accessoryNames.add(name);
                return { accessoryName: name, count: count };
            });
        });

        const assetResponse = await handleAssetSearch([...assetTags])
        const userResponse = await handleUserSearch([...userNames])
        const newAssetOptions = assetResponse.data;
        const newUserOptions = userResponse.data;

        let newAccessoryoptions = [];
        if (accessoryNames.size !== 0) {
          const accessoryResponse = await handleAccessorySearch([...accessoryNames]);
          newAccessoryoptions = accessoryResponse.data;
        }

        setAssetOptions(newAssetOptions);
        setUserOptions(newUserOptions);
        setAccessoryOptions(newAccessoryoptions);
    
        // Convert grouped records into loans
        const loans = records.map(({ assetTag, userNames, accessoryTypes }) => {
            // Find the asset ID based on assetTag
            const matchedAssetOption = newAssetOptions.find(option => option.label === assetTag);
            console.log(matchedAssetOption);
            const assetObj = {
                assetId: matchedAssetOption ? matchedAssetOption.value : null,
                assetTag: assetTag // Pass assetTag regardless of whether id is found
            };
        
            // Find the user IDs based on userNames (assuming userNames is an array of names)
            const userObjs = userNames.map(userName => {
                const matchedUserOption = newUserOptions.find(option => option.label === userName);
                console.log(matchedUserOption);
                return {
                    userId: matchedUserOption ? matchedUserOption.value : null,
                    userName: userName // Pass userName regardless of whether id is found
                };
            });
        
            // Find the accessoryType IDs based on accessoryType names (assuming accessoryTypes is an array of names)
            const accessoryObjs = accessoryTypes.map(({accessoryName, count}) => {
                const matchedAccessoryOption = newAccessoryoptions.find(option => option.label === accessoryName);
                return {
                  accessoryTypeId: matchedAccessoryOption ? matchedAccessoryOption.value : accessoryName,
                  accessoryName: accessoryName, // Pass accessoryName regardless of whether id is found
                  count: count
                };
            });

            console.log(accessoryObjs);
        
            // Create a new loan using the objects with both id and original values
            return createNewLoan(
                assetObj,    // Pass object with assetId and assetTag
                userObjs,    // Pass array of objects with userId and userName
                accessoryObjs // Pass array of objects with accessoryTypeId and accessoryName
            );
        });
    
      console.log(loans);
    
      setFormData({
        loans: loans
      });
    } catch (error) {
      handleError(error);
    }
  };

  const prevStep = () => {
    // const resetLoans = formData.loans.map(loan => {
    //   return createNewLoan(
    //     loan.asset, 
    //     loan.users,
    //     loan.asset.accessoryTypes,
    //     loan.loanDate,
    //     loan.expectedReturnDate
    //   );
    // })
    // setFormData((prevData) => ({
    //   ...prevData,
    //   loans: resetLoans
    // }));
    setStep(step - 1)
  };

  const nextStep = (values, actions) => {
    console.log('Manual Form Values:', values);
    const userLoans = {}
    const signatures = {};

    values.loans.forEach((loan) =>
      loan.users?.forEach((user) => {
        if (!userLoans[user.userId]) {
          userLoans[user.userId] = {}
          userLoans[user.userId].assets = [loan.asset];
          userLoans[user.userId].userName = user.userName;
          signatures[user.userId] = ''
          console.log(signatures);
        } else userLoans[user.userId].assets.push(loan.asset)
      })
    );
    setUserLoans(userLoans);
    setFormData((prevData) => ({
      ...prevData,
      ...values,
      signatures: signatures,
    }));
    setStep(step + 1);
  };

  const handleSubmit = async (values, actions) => {
    setLoading(true);
    console.log('Manual Form Values:', values);
    try {
      await assetService.loanAsset(values);
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