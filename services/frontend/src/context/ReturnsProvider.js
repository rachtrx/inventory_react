import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useUI } from "./UIProvider";
import assetService from "../services/AssetService";
import { createNewLoan } from "../components/forms/loan/Loan";
import { Box } from "@chakra-ui/react";
import { useFormModal } from "./ModalProvider";
import { createNewPeripheral, createNewReturn } from "../components/forms/return/Return";

// Create a context
const ReturnsContext = createContext();

// Create a provider component
export const ReturnsProvider = ({ children }) => {
  const { setLoading, showToast, handleError } = useUI();
  const { setFormType, initialValues, handleAssetSearch, handleUserSearch, handlePeripheralSearch } = useFormModal();
  const [ warnings, setWarnings ] = useState({});

  const [assetOptions, setAssetOptions] = useState([]);
  const [userOptions, setUserOptions] = useState([]);
  const [peripheralOptions, setPeripheralOptions] = useState([]);
  const [formData, setFormData] = useState({
    returns: [createNewReturn()],
  });
  const [userReturns, setUserReturns] = useState({});
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (initialValues) {
      if(initialValues.asset) setAssetOptions([{value: initialValues.asset.id, label: initialValues.asset.assetTag}])
      
      const users = []
      if(initialValues.user) {
        users.push(initialValues.user)
        setUserOptions([{value: initialValues.user.id, label: initialValues.user.userName}])
      }
      
      setFormData({
        returns: [createNewLoan(initialValues.asset, users)],
      });
    }
  }, [initialValues, setFormData]);

  // useEffect(() => {
  //   if (initialValues) {
  //     const loadPresetValues = async () => {
  //       await setValuesExcel([initialValues]);
  //     };

  //     loadPresetValues();
  //   }
  // }, [initialValues, ]);

  const fetchReturn = async (assetIds) => {
    try {
      const assetsDict = await assetService.fetchReturn(assetIds)
      return assetsDict;
    } catch (error) {
      throw error;
    }
  }

  const setValuesExcel = async (records) => {
    // CANNOT SEARCH FOR ASSET HERE, MAYBE CAN TRY IN FUTURE TO GET THE UPDATED VALUE
    try {

        const assetTags = new Set();

        records.forEach(record => {
            // Trim and add asset tags to the set
            record.assetTag = record.assetTag?.trim();
            if (record.assetTag) {
                if (assetTags.has(record.assetTag)) throw new Error(`Duplicate records for assetTag: ${record.assetTag} were found`);
                else assetTags.add(record.assetTag);
            } 
        });

        const assetResponse = await handleAssetSearch([...assetTags])
        const newAssetOptions = assetResponse.data;
        const assetsDict = await fetchReturn(newAssetOptions.map(option => option.value));

        setAssetOptions(newAssetOptions);

        const returns = records.map(({assetTag}) => {
          const matchedAssetOption = newAssetOptions.find(option => option.label === assetTag);
          const matchedAssetId = matchedAssetOption?.value || null
          const assetObj = {
            id: matchedAssetId,
            assetTag: assetTag // Pass assetTag regardless of whether id is found
          };

          if (!matchedAssetId || !assetsDict[matchedAssetId]?.ongoingLoan) {
            return createNewLoan(assetObj);
          }

          const ongoingLoan = assetsDict[matchedAssetId].ongoingLoan;

          return createNewReturn(
            assetObj,
            ongoingLoan.users,
            ongoingLoan.peripherals
          )
        })
    
      console.log(returns);
    
      setFormData({
        returns: returns
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
    const userReturns = {}
    const signatures = {};

    values.loans.forEach((loan) =>
      loan.users?.forEach((user) => {
        if (!userReturns[user.userId]) {
          userReturns[user.userId] = {}
          userReturns[user.userId].assets = [loan.asset];
          userReturns[user.userId].userName = user.userName;
          signatures[user.userId] = ''
          console.log(signatures);
        } else userReturns[user.userId].assets.push(loan.asset)
      })
    );
    setUserReturns(userReturns);
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
      // await assetService.returnAsset(values);
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
    fetchReturn,
    assetOptions,
    userOptions,
    peripheralOptions,
    formData,
    userReturns,
    step,
    setAssetOptions,
    setUserOptions,
    setPeripheralOptions,
    setFormData,
    setUserReturns,
    setStep,
    setValuesExcel,
    prevStep,
    nextStep,
    handleSubmit,
    warnings,
    setWarnings
  };

  return <ReturnsContext.Provider value={value}>{children}</ReturnsContext.Provider>;
};

// Hook to use the LoanContext in child components
export const useReturns = () => {
  return useContext(ReturnsContext);
};