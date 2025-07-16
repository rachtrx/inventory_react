import React, { createContext, useContext, useEffect, useState } from "react";
import { DelAssetStep2 } from "./DelAssetStep2";
import { DelAssetStep1 } from "./DelAssetStep1";
import { useUI } from "../../../../context/UIProvider";
import assetService from "../../../../services/AssetService";
import { Box } from "@chakra-ui/react";
import { useFormModal } from "../../../../context/ModalProvider";
import { v4 as uuidv4 } from 'uuid';
import { compareStrings, convertExcelDate } from "../../utils/validation";
import { useLoading } from "../../../../context/LoadingProvider";
import { useItems } from "../../../../context/ItemsProvider";

export const delNewAsset = (asset={}) => ({
  'key': uuidv4(),
  'assetId': asset.assetId || '',
  'serialNumber': asset.serialNumber || '', // TODO if we move to serialNumber instead of tag
  'delDate': asset.delDate || new Date(),
  'lastEventDate': asset.lastEventDate || '',
  'remarks': asset.remarks || '',
})

// Create a context
const DelAssetsContext = createContext();

// Create a provider component
export const DelAssetsProvider = ({ children }) => {
  const { showToast, handleError } = useUI();
  const { setLoading } = useLoading();
  const { setFormType, initialValues, triggerRefresh } = useFormModal();
  const [ warnings, setWarnings ] = useState({});

  const [assetOptions, setAssetOptions] = useState([]);

  const [formData, setFormData] = useState({
    assets: [delNewAsset()],
  });
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (!initialValues?.serialNumbers?.length) return;

    const fetchAstDeletes = async () => {
      const assetResponse = await assetService.fetchAstDel(initialValues.serialNumbers);
      setAssetOptions(assetResponse.data);

      const assetObjs = initialValues.serialNumbers.map(serialNumber => {
        const matchedAssetOption = assetResponse.data.find(assetOption => assetOption.serialNumber === serialNumber);
        if (!matchedAssetOption || matchedAssetOption.isDisabled) return { serialNumber }
        else return matchedAssetOption;
      })
      const assets = assetObjs.map(asset => {
        return delNewAsset(asset);
      })
      setFormData({assets});
    }
    fetchAstDeletes()
  }, [initialValues, setFormData]);

  const setValuesExcel = async (records) => {
    // CANNOT SEARCH FOR ASSET HERE, MAYBE CAN TRY IN FUTURE TO GET THE UPDATED VALUE
    try {
      const serialNumbers = new Set();

      records.forEach((record) => {

        Object.keys(record).forEach(field => {
          record[field] = field !== 'delDate'
            ? record[field]?.toString().trim()
            : record[field] ? convertExcelDate(record[field], record.__rowNum__) : new Date();
        });

        ['serialNumber'].forEach(field => {
          if (!record[field]) throw new Error(`Missing ${field} at line ${record.__rowNum__}`);
        });
        
        if (serialNumbers.has(record.serialNumber)) throw new Error(`Duplicate records for serialNumber: ${record.serialNumber} were found`);
        else serialNumbers.add(record.serialNumber);
      });

      const assetResponse = await assetService.fetchAstDel([...serialNumbers]);
      // console.log(assetResponse.data);
      const newAssetOptions = assetResponse.data;
      setAssetOptions(newAssetOptions);

      const assets = records.map((record) => {
        const { serialNumber, remarks, delDate } = record;
        const matchedAssetOption = newAssetOptions.find(option => compareStrings(option.value, serialNumber));

        if (!matchedAssetOption || matchedAssetOption.isDisabled) {
          return {
            serialNumber, // Pass serialNumber regardless of whether id is found
            delDate,
            remarks,
          }
        } else {  
          return {
            assetId: matchedAssetOption ? matchedAssetOption.assetId : null,
            lastEventDate: matchedAssetOption ? matchedAssetOption.lastEventDate : null,
            serialNumber,
            delDate,
            remarks,
          }
        }
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

  const nextStep = (values) => {
    setFormData((prevData) => ({
      ...prevData,
      ...values
    }));
    setStep(step + 1);
  };

  const handleSubmit = async (values, actions) => {
    setLoading(true);
    console.log('Manual Form Values:', values);
    try {
      await assetService.delAsset(values);
      actions.setSubmitting(false);
      setLoading(false);
      showToast('Assets successfully deleted', 'success', 500);
      setFormType(null);
      triggerRefresh();;
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