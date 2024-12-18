import React, { createContext, useContext, useEffect, useState } from "react";
import { AddAssetStep2 } from "./AddAssetStep2";
import { AddAssetStep1 } from "./AddAssetStep1";
import { useUI } from "../../../context/UIProvider";
import assetService from "../../../services/AssetService";
import { Box } from "@chakra-ui/react";
import { useFormModal } from "../../../context/ModalProvider";
import { v4 as uuidv4 } from 'uuid';
import { compareStrings, convertExcelDate } from "../utils/validation";

export const createNewType = (type={}) => ({
  'key': uuidv4(),
  'typeId': type.typeId || '',
  'typeName': type.typeName || '',
  'subTypes': (type.subTypes || [{}]).map(subType => createNewSubType(subType))
})

export const createNewSubType = (subType={}) => ({
  'key': uuidv4(),
  'subTypeId': subType.subTypeId || '',
  'subTypeName': subType.subTypeName || '',
  'assets': (subType.assets || [{}]).map(asset => createNewAsset(asset)),
})

export const createNewAsset = (asset={}) => ({
  'key': uuidv4(),
  'assetTag': asset.assetTag || '',
  'serialNumber': asset.serialNumber || '',
  'vendorName': asset.vendorName || '',
  'cost': asset.cost || '',
  'remarks': asset.remarks || '',
  'addDate': asset.addDate || new Date(),
})

// Create a context
const AddAssetsContext = createContext();

// Create a provider component
export const AddAssetsProvider = ({ children }) => {
  const { setLoading, showToast, handleError } = useUI();
  const { setFormType } = useFormModal();
  const [ warnings, setWarnings ] = useState({});

  const [vendorOptions, setVendorOptions] = useState([]);

  const [typeOptions, setTypeOptions] = useState([]);
  const [subTypeOptionsDict, setSubTypeOptionsDict] = useState([]);

  const [formData, setFormData] = useState({
    types: [createNewType()],
  });
  const [step, setStep] = useState(1);

  useEffect(() => {
    console.log(typeOptions);
    console.log(vendorOptions);
  }, [typeOptions, vendorOptions])

  useEffect(() => {
    const fetchFilters = async () => {
        const typeFilters = await getTypeFilters();
        const vendorFilters = await getVendorFilters();
        
        setTypeOptions(typeFilters);
        setVendorOptions(vendorFilters);
    };

    fetchFilters();
  }, []);

  const getTypeFilters = async () => {
      const response = await assetService.getFilters('typeName');
      const options = response.data;
      return options.map(option => ({
          typeId: option.value,
          value: option.label,
          label: option.label
      }));
  };

  const getVendorFilters = async () => {
      const response = await assetService.getFilters('vendor');
      const options = response.data;
      return options.map(option => ({
          vendorId: option.value,
          value: option.label,
          label: option.label
      }));
  };

  const setValuesExcel = async (records) => {
    // CANNOT SEARCH FOR ASSET HERE, MAYBE CAN TRY IN FUTURE TO GET THE UPDATED VALUE
    try {
      const assetTags = new Set();
      const serialNumbers = new Set();
      const subTypeSet = new Set();

      const recordsMap = {};

      records.forEach((record) => {

        Object.keys(record).forEach(field => {
          record[field] = field !== 'addDate'
            ? record[field]?.toString().trim()
            : record[field] ? convertExcelDate(record[field], record.__rowNum__) : new Date();
        });

        ['type', 'subType', 'assetTag', 'serialNumber'].forEach(field => {
          if (!record[field]) throw new Error(`Missing ${field} at line ${record.__rowNum__}`);
        });

        const { type, subType, assetTag, serialNumber, vendorName, cost, remarks, addDate } = record;
        
        if (assetTags.has(assetTag)) throw new Error(`Duplicate records for assetTag: ${assetTag} were found`);
        else assetTags.add(assetTag);
        
        if (serialNumbers.has(serialNumber)) throw new Error(`Duplicate records for Serial Number: ${serialNumber} were found`);
        else serialNumbers.add(serialNumber);     

        if (!recordsMap[type]) {
          recordsMap[type] = {};
        }
        
        if (!recordsMap[type][subType]) {
          if (subTypeSet.has(subType)) throw new Error(`Error for ${subType}: Subtype names must be different across types`)
          else subTypeSet.add(subType);
          recordsMap[type][subType] = [];
        }
        
        recordsMap[type][subType].push({
          assetTag,
          serialNumber,
          vendorName,
          cost,
          addDate,
          remarks
        });
      });

      const typeIds = typeOptions.map(option => option.typeId); // type options loaded upon form creation

      const subTypesResponse = await assetService.getSubTypeFilters(typeIds);
      const subTypeOptionsMap = subTypesResponse.data;

      const types = [];

      Object.entries(recordsMap).forEach(([typeName, subTypeObjs]) => {
        let typeId = '';
        const type = typeOptions.find(option => compareStrings(option.value, typeName));
        if (type) {
          typeId = type.typeId;
          typeName = type.value; // update the typename
        }

        const subTypes = [];

        Object.entries(subTypeObjs).forEach(([subTypeName, assetObjs]) => {
          let subTypeId = '';
          if (typeId) {
            const subType = subTypeOptionsMap[typeId].find(option => compareStrings(option.value, subTypeName));
            if (subType) {
              subTypeId = subType.subTypeId;
              subTypeName = subType.value;
            }
          }

          const assets = assetObjs.map(asset => {
            let vendorId = '';
            let vendorName = asset.vendorName;
            const vendor = vendorOptions.find(option => compareStrings(option.value, vendorName));
            if (vendor) {
              vendorId = vendor.vendorId;
              vendorName = vendor.value; // update the typename
            }
            return {
              ...asset,
              vendorId,
              vendorName
            }
          })
          
          subTypes.push(createNewSubType({
            subTypeId: subTypeId,
            subTypeName: subTypeName,
            assets: assets,
          }));
        })

        types.push(createNewType({
          typeId: typeId,
          typeName: typeName,
          subTypes: subTypes,
        }))
      })

      console.log(subTypeOptionsMap);

      setSubTypeOptionsDict(subTypeOptionsMap);
    
      setFormData({
        types: types
      });

    } catch (error) {
      handleError(error);
    }
  };

  const prevStep = () => {
    setStep(step - 1)
  };

  const nextStep = () => {
    setStep(step + 1);
  };

  const handleSubmit = async (values, actions) => {
    setLoading(true);
    console.log('Manual Form Values:', values);
    try {
      await assetService.addAsset(values);
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
    typeOptions,
    vendorOptions,
    subTypeOptionsDict,
    formData,
    step,
    setSubTypeOptionsDict,
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
    <AddAssetsContext.Provider value={value}>
      <Box style={{ display: step === 1 ? 'block' : 'none' }}>
        <AddAssetStep1/>
      </Box>
      <Box style={{ display: step === 2 ? 'block' : 'none' }}>
        <AddAssetStep2/>
      </Box>
    </AddAssetsContext.Provider>
  )
};

// Hook to use the LoanContext in child components
export const useAddAssets = () => {
  return useContext(AddAssetsContext);
};