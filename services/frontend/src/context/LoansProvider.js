import React, { createContext, useContext, useEffect, useState } from "react";
import { LoanStep2 } from "../components/forms/loan/LoanStep2";
import { LoanStep1 } from "../components/forms/loan/LoanStep1";
import { useUI } from "./UIProvider";
import assetService from "../services/AssetService";
import { createNewLoan } from "../components/forms/loan/Loan";
import { Box } from "@chakra-ui/react";
import { useFormModal } from "./ModalProvider";

// Create a context
const LoansContext = createContext();

// Create a provider component
export const LoansProvider = ({ children }) => {
  const { setLoading, showToast, handleError } = useUI();
  const { setFormType, initialValues, handleAssetSearch, handleUserSearch, handlePeripheralSearch } = useFormModal();
  const [ warnings, setWarnings ] = useState({});

  const [assetOptions, setAssetOptions] = useState([]);
  const [userOptions, setUserOptions] = useState([]);
  const [peripheralOptions, setPeripheralOptions] = useState([]);
  const [formData, setFormData] = useState({
    loans: [createNewLoan()],
    signatures: {},
  });
  const [userLoans, setUserLoans] = useState({});
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (initialValues) {
      setFormData({
        loans: [createNewLoan(initialValues.asset, initialValues.user)],
        signatures: {},
      });
    }
  }, [initialValues, setFormData]);

  const processPeripherals = (peripheralsString) => {
    if (!peripheralsString) return {};
    return peripheralsString.split(',').map(peripheral => peripheral.trim()).reduce((acc, peripheral) => {
      if (acc[peripheral]) {
        acc[peripheral] += 1;
      } else {
        acc[peripheral] = 1;
      }
      return acc;
    }, {});
  };

  const setValuesExcel = async (records) => {
    // CANNOT SEARCH FOR ASSET HERE, MAYBE CAN TRY IN FUTURE TO GET THE UPDATED VALUE
    try {

        const assetTags = new Set();
        const userNames = new Set();
        const peripheralNames = new Set();

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
        
            // Process peripherals
            const processedPeripherals = processPeripherals(record.peripherals);
            record.peripherals = Object.entries(processedPeripherals).map(([name, count]) => {
                peripheralNames.add(name);
                return { peripheralName: name, count: count };
            });
        });

        const assetResponse = await handleAssetSearch([...assetTags])
        const userResponse = await handleUserSearch([...userNames])
        const peripheralResponse = await handlePeripheralSearch([...peripheralNames])

        const newAssetOptions = assetResponse.data;
        const newUserOptions = userResponse.data;
        const newPeripheraloptions = peripheralResponse.data;

        setAssetOptions(newAssetOptions);
        setUserOptions(newUserOptions);
        setPeripheralOptions(newPeripheraloptions);
    
        // Convert grouped records into loans
        const loans = records.map(({ assetTag, userNames, peripherals }) => {
            // Find the asset ID based on assetTag
            const matchedAssetOption = newAssetOptions.find(option => option.label === assetTag);
            console.log(matchedAssetOption);
            const assetObj = {
                id: matchedAssetOption ? matchedAssetOption.value : null,
                assetTag: assetTag // Pass assetTag regardless of whether id is found
            };
        
            // Find the user IDs based on userNames (assuming userNames is an array of names)
            const userObjs = userNames.map(userName => {
                const matchedUserOption = newUserOptions.find(option => option.label === userName);
                console.log(matchedUserOption);
                return {
                    id: matchedUserOption ? matchedUserOption.value : null,
                    userName: userName // Pass userName regardless of whether id is found
                };
            });
        
            // Find the peripheral IDs based on peripheral names (assuming peripherals is an array of names)
            const peripheralObjs = peripherals.map(({peripheralName, count}) => {
                const matchedPeripheralOption = newPeripheraloptions.find(option => option.label === peripheralName);
                return {
                    id: matchedPeripheralOption ? matchedPeripheralOption.value : peripheralName,
                    peripheralName: peripheralName, // Pass peripheralName regardless of whether id is found
                    count: count
                };
            });

            console.log(peripheralObjs);
        
            // Create a new loan using the objects with both id and original values
            return createNewLoan(
                assetObj,    // Pass object with assetId and assetTag
                userObjs,    // Pass array of objects with userId and userName
                peripheralObjs // Pass array of objects with peripheralId and peripheralName
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
    //     loan.asset.peripherals,
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
    peripheralOptions,
    formData,
    userLoans,
    step,
    setAssetOptions,
    setUserOptions,
    setPeripheralOptions,
    setFormData,
    setUserLoans,
    setStep,
    processPeripherals,
    setValuesExcel,
    prevStep,
    nextStep,
    handleSubmit,
    warnings,
    setWarnings
  };

  return <LoansContext.Provider value={value}>{children}</LoansContext.Provider>;
};

// Hook to use the LoanContext in child components
export const useLoans = () => {
  return useContext(LoansContext);
};