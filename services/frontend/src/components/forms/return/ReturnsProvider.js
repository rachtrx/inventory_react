import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useUI } from "../../../context/UIProvider";
import assetService from "../../../services/AssetService";
import { createNewLoan } from "../loan/Loan";
import { Box } from "@chakra-ui/react";
import { useFormModal } from "../../../context/ModalProvider";
import { createNewAccessory, createNewReturn } from "./Return";
import ReturnStep1 from "./ReturnStep1";
import { ReturnStep2 } from "./ReturnStep2";

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
          const {assetId, assetTag} = initialValues
          setAssetOptions([{value: assetId, label: assetTag}]);
          const assetsDict = await fetchReturn([assetId]);
          const ongoingLoan = assetsDict[assetId].ongoingLoan;
          setUserOptions(ongoingLoan.users.map(user => ({value: user.userId, label: user.userName})))

          setFormData({
            returns: [createNewReturn(
              {assetId, assetTag},
              ongoingLoan.users,
              ongoingLoan.accessories
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
      
      const userIdSet = new Set();
      const newUserOptions = []

      const returns = records.map(({assetTag}) => {
        const matchedAssetOption = newAssetOptions.find(option => option.label === assetTag);
        const matchedAssetId = matchedAssetOption?.value || null;
        const assetObj = {
          assetId: matchedAssetId || assetTag,
          assetTag: assetTag // Pass assetTag regardless of whether id is found
        };

        if (!matchedAssetId || !assetsDict[matchedAssetId]?.ongoingLoan) {
          return createNewReturn(assetObj);
        }

        const ongoingLoan = assetsDict[matchedAssetId].ongoingLoan;

        ongoingLoan.users.forEach(user => {
          if (!userIdSet.has(user.userId)) {
            newUserOptions.push({ value: user.userId, label: user.userName });
            userIdSet.add(user.userId);
          }
        });

        return createNewReturn(
          assetObj,
          ongoingLoan.users,
          ongoingLoan.accessories
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
        accessories: ret.accessories,
        users: {
          userIds: [...ret.users.userIds], // shallow copy
          userNames: [...ret.users.userNames], // shallow copy
        }
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