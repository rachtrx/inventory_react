import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useUI } from "../../../context/UIProvider";
import assetService from "../../../services/AssetService";
import { Box } from "@chakra-ui/react";
import { useFormModal } from "../../../context/ModalProvider";
import { createNewAccessory, createNewReturn } from "./Return";
import ReturnStep1 from "./ReturnStep1";
import { ReturnStep2 } from "./ReturnStep2";
import { compareStrings, convertExcelDate } from "../utils/validation";

// Create a context
const ReturnsContext = createContext();

// Create a provider component
export const ReturnsProvider = ({ children }) => {
  const { setLoading, showToast, handleError } = useUI();
  const { setFormType, initialValues, handleAssetSearch } = useFormModal();
  const [ warnings, setWarnings ] = useState({});

  const [assetOptions, setAssetOptions] = useState([]);
  const [userOptions, setUserOptions] = useState([]);
  const [peripheralOptions, setPeripheralOptions] = useState([]);
  const [formData, setFormData] = useState({
    returns: [createNewReturn()],
  });
  const [userReturns, setUserReturns] = useState({});
  const [step, setStep] = useState(1);

  useEffect(() => console.log(formData), [formData])
  useEffect(() => console.log(assetOptions), [assetOptions])
  useEffect(() => console.log(userOptions), [userOptions])

  const fetchReturn = useCallback(async (assetIds) => {
    try {
      const response = await assetService.fetchReturn(assetIds);
      console.log(response.data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }, [])

  useEffect(() => {
    if (initialValues) {
      const loadPresetValues = async () => {
        try {
          console.log(initialValues);
          const {assetId, assetTag} = initialValues;
          setAssetOptions([{value: assetTag, label: assetTag, assetId: assetId}]);
          const assetsDict = await fetchReturn([assetId]);
          console.log(assetsDict);
          const loan = assetsDict[assetId].ongoingLoan?.loan;
          const users = loan.userLoans.map(userLoan => userLoan.user)
          setUserOptions(users.map(user => ({
            value: user.userName, 
            label: user.userName, 
            userId: user.userId
          })));

          setFormData({
            returns: [createNewReturn(
              {assetId, assetTag},
              users,
              loan.accLoans
            )]
          });
        } catch (err) {
          console.error(err);
          handleError('Error Loading Details')
        }
      };
      loadPresetValues();
    }
  }, [initialValues, handleError, fetchReturn]);

  const setValuesExcel = useCallback(async (records) => {
    // CANNOT SEARCH FOR ASSET HERE, MAYBE CAN TRY IN FUTURE TO GET THE UPDATED VALUE
    try {

      const assetTags = new Set();

      records.forEach(record => {
          // Trim and add asset tags to the set
          Object.keys(record).forEach(field => {
            record[field] = record[field]?.toString().trim();
          });
  
          ['assetTag'].forEach(field => {
            if (!record[field]) throw new Error(`Missing ${field} at line ${record.__rowNum__}`);
          });
          
          if (assetTags.has(record.assetTag)) throw new Error(`Duplicate records for assetTag: ${record.assetTag} were found`);
          else assetTags.add(record.assetTag);
      });

      const assetResponse = await handleAssetSearch([...assetTags])
      const newAssetOptions = assetResponse.data; // gets all possible asset tags, some possibly missing
      
      const assetsDict = await fetchReturn(newAssetOptions.map(option => option.assetId)); // gets all ongoing loans of the subset of asset tags

      setAssetOptions(newAssetOptions);
      
      const userIdSet = new Set();
      const newUserOptions = []

      const returns = records.map(({assetTag, remarks}) => {
        const matchedAssetOption = newAssetOptions.find(option => compareStrings(option.value, assetTag));

        if (!matchedAssetOption) {
          throw new Error(`Unable to find asset tag ${assetTag}`);
        }

        const matchedAssetId = matchedAssetOption.assetId || null;
        if (!assetsDict[matchedAssetId]?.ongoingLoan) {
          throw new Error(`Unable to find ongoing loan for asset tag ${assetTag}`);
        }

        const assetObj = {
          assetId: matchedAssetId,
          assetTag: matchedAssetOption?.value || assetTag // Pass assetTag regardless of whether id is found
        };

        const loan = assetsDict[matchedAssetId].ongoingLoan.loan;
        console.log(loan);
        const users = loan.userLoans.map(userLoan => userLoan.user)

        users.forEach(user => {
          if (!userIdSet.has(user.userId)) {
            newUserOptions.push({ value: user.userName, label: user.userName, userId: user.userId });
            userIdSet.add(user.userId);
          }
        });

        return createNewReturn(
          assetObj,
          users.filter(user => userIdSet.has(user.userId)),
          loan.accLoans,
          remarks,
        )
      })

      setUserOptions(newUserOptions);
    
      console.log(returns);
    
      setFormData({
        returns: returns
      });
    } catch (error) {
      handleError(error);
    }
  }, [handleAssetSearch, setAssetOptions, fetchReturn, setFormData, handleError]); 

  const prevStep = () => {
    setStep(Math.min(step - 1, 1))
  };

  const nextStep = (values, actions) => {
    console.log('Manual Form Values:', values);

    const newUserReturns = {}

    values.returns.forEach((ret) => {
      // If assetTag doesn't exist in newUserReturns, initialize it
      if (newUserReturns[ret.assetTag]) throw Error(`Duplicate Asset Tag ${ret.assetTag} found`)

      newUserReturns[ret.assetTag] = {
        assetId: ret.assetId,
        accessoryTypes: ret.accessoryTypes,
        userIds: ret.users.userIds,
        userNames: ret.users.userNames,
      };
    });
    setUserReturns(newUserReturns);
    setStep(Math.max(step + 1, 2));
  };

  const handleSubmit = async (values, actions) => {
    setLoading(true);
    console.log('Manual Form Values:', values);
    try {
      await assetService.returnAsset(values);
      actions.setSubmitting(false);
      setLoading(false);
      showToast('Assets successfully returned', 'success', 500);
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

  return (
    <ReturnsContext.Provider value={value}>
      <Box style={{ display: step === 1 ? 'block' : 'none' }}>
        <ReturnStep1/>
      </Box>
      <Box style={{ display: step === 2 ? 'block' : 'none' }}>
        <ReturnStep2/>
      </Box>
    </ReturnsContext.Provider>
  );
};

// Hook to use the LoanContext in child components
export const useReturns = () => {
  return useContext(ReturnsContext);
};