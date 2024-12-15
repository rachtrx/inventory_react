import React, { createContext, useContext, useEffect, useState } from "react";
import { DelAssetStep2 } from "./DelAssetStep2";
import { DelAssetStep1 } from "./DelAssetStep1";
import { useUI } from "../../../context/UIProvider";
import assetService from "../../../services/AssetService";
import { Box } from "@chakra-ui/react";
import { useFormModal } from "../../../context/ModalProvider";
import { v4 as uuidv4 } from 'uuid';
import { compareStrings, convertExcelDate } from "../utils/validation";

export const delNewAsset = (asset={}) => ({
  'key': uuidv4(),
  'assetId': asset.assetId || '',
  'assetTag': asset.assetTag || '',
  // 'serialNumber': asset.serialNumber || '', // TODO if we move to serialNumber instead of tag
  'delDate': asset.delDate || new Date(),
  'lastEventDate': asset.lastEventDate || '',
  'remarks': asset.remarks || '',
})

// Create a context
const DelAssetsContext = createContext();

// Create a provider component
export const DelAssetsProvider = ({ children }) => {
  const { setLoading, showToast, handleError } = useUI();
  const { setFormType, initialValues, handleAssetSearch } = useFormModal();
  const [ warnings, setWarnings ] = useState({});

  const [assetOptions, setAssetOptions] = useState([]);

  const [formData, setFormData] = useState({
    assets: [delNewAsset()],
  });
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (initialValues) {
      console.log(initialValues);
      let asset = null;
      if(initialValues.assetId) {
        asset = initialValues;
        setAssetOptions([{value: initialValues.assetTag, label: initialValues.assetTag, assetId: initialValues.assetId}])
      }
      
      setFormData({
        assets: [delNewAsset(asset)]
      });
    }
  }, [initialValues, setFormData]);

  const setValuesExcel = async (records) => {
    // CANNOT SEARCH FOR ASSET HERE, MAYBE CAN TRY IN FUTURE TO GET THE UPDATED VALUE
    try {
      const assetTags = new Set();
      // const serialNumbers = new Set();

      records.forEach((record) => {

        Object.keys(record).forEach(field => {
          record[field] = field !== 'delDate'
            ? record[field]?.toString().trim()
            : record[field] ? convertExcelDate(record[field], record.__rowNum__) : new Date();
        });

        ['assetTag'].forEach(field => {
          if (!record[field]) throw new Error(`Missing ${field} at line ${record.__rowNum__}`);
        });
        
        if (assetTags.has(record.assetTag)) throw new Error(`Duplicate records for assetTag: ${record.assetTag} were found`);
        else assetTags.add(record.assetTag);
      });

      const assetResponse = await handleAssetSearch([...assetTags]);
      const newAssetOptions = assetResponse.data;
      setAssetOptions(newAssetOptions);

      const assets = records.map((record) => {
        const { assetTag, remarks, delDate } = record;
        const matchedAssetOption = newAssetOptions.find(option => compareStrings(option.value, assetTag));
        
        return {
            assetId: matchedAssetOption ? matchedAssetOption.assetId : null,
            lastEventDate: matchedAssetOption ? matchedAssetOption.lastEventDate : null,
            assetTag, // Pass assetTag regardless of whether id is found
            delDate,
            remarks,
        };
      })
    
      setFormData({
        assets: assets.map(asset => delNewAsset(asset))
      });

    } catch (error) {
      handleError(error);
    }
  };

  const prevStep = () => {
    setStep(step - 1)
  };

  const nextStep = (values, actions) => {
    // console.log('Manual Form Values:', values);
    // const userLoans = {}
    // const signatures = {};

    // values.loans.forEach((loan) =>
    //   loan.users?.forEach((user) => {
    //     if (!userLoans[user.userId]) {
    //       userLoans[user.userId] = {}
    //       userLoans[user.userId].assets = [loan.asset];
    //       userLoans[user.userId].userName = user.userName;
    //       signatures[user.userId] = ''
    //       console.log(signatures);
    //     } else userLoans[user.userId].assets.push(loan.asset)
    //   })
    // );
    // setUserLoans(userLoans);
    // setFormData((prevData) => ({
    //   ...prevData,
    //   ...values,
    //   signatures: signatures,
    // }));
    setStep(step + 1);
  };

  const handleSubmit = async (values, actions) => {
    setLoading(true);
    console.log('Manual Form Values:', values);
    try {
      await assetService.delAsset(values);
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
    formData,
    step,
    setFormData,
    setStep,
    setValuesExcel,
    prevStep,
    nextStep,
    handleSubmit,
    warnings,
    setWarnings
  };

  return (
    <DelAssetsContext.Provider value={value}>
      <Box style={{ display: step === 1 ? 'block' : 'none' }}>
        <DelAssetStep1/>
      </Box>
      <Box style={{ display: step === 2 ? 'block' : 'none' }}>
        <DelAssetStep2/>
      </Box>
    </DelAssetsContext.Provider>
  )
};

// Hook to use the LoanContext in child components
export const useDelAssets = () => {
  return useContext(DelAssetsContext);
};