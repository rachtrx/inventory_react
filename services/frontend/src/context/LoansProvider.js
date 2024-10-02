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

  const setValuesExcel = (records) => {
    // CANNOT SEARCH FOR ASSET HERE, MAYBE CAN TRY IN FUTURE TO GET THE UPDATED VALUE
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

      const a_options = []
      const u_options = []
      const p_options = []

      const assetIdSet = new Set()
      const userIdSet = new Set()
      const peripheralIdSet = new Set()
    
      // Convert grouped records into loans
      const loans = Object.entries(groupedRecords).map(([assetTag, { userNames, peripheralNames }], loanIndex) => { 
        const assets = handleAssetSearch(assetTag)?.filter(option => option.label === assetTag);


        const users = userNames.forEach((userName, userIndex) => {
          const userList = handleUserSearch(userName)?.filter(option => option.label === userName);
          userList.forEach(user => { 
            if (!userIdSet.has(user.label)) {
              userIdSet.add(user.label);
              user.userId = user.value;
              u_options.push(user);
            }
          });
        });

        const peripherals = peripheralNames.forEach((peripheralName, peripheralIndex) => {
          const peripheralList = handlePeripheralSearch(peripheralName)?.filter(option => option.label === peripheralName);

          peripheralList.forEach(peripheral => {
            if (!peripheralIdSet.has(peripheral.label)) {
              peripheralIdSet.add(peripheral.label);
              peripheral.peripheralId = peripheral.value;
              p_options.push(peripheral);
            }
          });
        })

        // Process assets, users, and peripherals when there are no errors
        assets.forEach(asset => {
          if (!assetIdSet.has(asset.label)) {
            assetIdSet.add(asset.label);
            asset.assetId = asset.value;
            a_options.push(asset);
          }
        });

        setAssetOptions(a_options);
        setUserOptions(u_options);
        setPeripheralOptions(p_options);

        return createNewLoan(
          assetTag,
          userNames,
          peripherals,
        )
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
    const resetLoans = formData.loans.map(loan => {
      return createNewLoan(
        loan.asset, 
        loan.users,
        loan.asset.peripherals,
        loan.loanDate,
        loan.expectedReturnDate
      );
    })
    setFormData((prevData) => ({
      ...prevData,
      loans: resetLoans
    }));
    setStep(step - 1)
  };

  const handleUserData = (values, actions) => {
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
    handleUserData,
    handleSubmit,
    warnings,
    setWarnings
  };

  return <LoansContext.Provider value={value}>{children}</LoansContext.Provider>;
};

// Hook to use the LoanContext in child components
export const useLoansContext = () => {
  return useContext(LoansContext);
};