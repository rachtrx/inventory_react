import React, { createContext, useContext, useEffect, useState } from "react";
import { AddAssetStep2 } from "./AddAssetStep2";
import { AddAssetStep1 } from "./AddAssetStep1";
import { useUI } from "../../../context/UIProvider";
import assetService from "../../../services/AssetService";
import { Box } from "@chakra-ui/react";
import { useFormModal } from "../../../context/ModalProvider";
import { v4 as uuidv4 } from 'uuid';

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
  'vendor': asset.vender || '',
  'cost': asset.cost || '',
  'remarks': '',
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
      const typeSet = new Set();
      const subTypeSet = new Set();

      const recordsMap = {};

      records.forEach((record, idx) => {

        Object.keys(record).forEach(field => {
          record[field] = record[field]?.trim();
        });

        const { type, subType, assetTag, serialNumber, vendor, cost, remarks } = record;

        [type, subType, assetTag, serialNumber].forEach(field => {
          if (!field) throw new Error(`Missing ${field} at index ${idx + 1}`);
        });

        if (assetTags.has(assetTag)) throw new Error(`Duplicate records for assetTag: ${assetTag} were found`);
        else assetTags.add(assetTag);
        
        if (serialNumbers.has(serialNumber)) throw new Error(`Duplicate records for Serial Number: ${serialNumber} were found`);
        else serialNumbers.add(serialNumber);     

        if (!recordsMap[type]) {
          if (typeSet.has(type)) throw new Error(`Duplicate types are not allowed: ${type}`)
          else typeSet.add(type);
          recordsMap[type] = {};
        }
        
        if (!recordsMap[type][subType]) {
          if (subTypeSet.has(subType)) throw new Error(`Duplicate subTypes are not allowed: ${subType}`)
          else subTypeSet.add(subType);
          recordsMap[type][subType] = [];
        }
        
        recordsMap[type][subType].push({
          assetTag,
          serialNumber,
          vendor,
          cost,
          remarks
        });
      });

      const typeIds = typeOptions.map(option => option.value);

      const subTypesResponse = await assetService.getSubTypeFilters(typeIds);
      const subTypeOptionsMap = subTypesResponse.data;

      const types = [];

      Object.keys(recordsMap).forEach(type => {
        const typeId = typeOptions.find(option => option.value === type) || '';

        const subTypes = [];

        Object.keys(type).forEach(subType => {
          let subTypeId = '';
          if (typeId) {
            subTypeId = subTypeOptionsMap[typeId].find(option => option.value === subType);
          }
          
          subTypes.push({
            subTypeId: subTypeId,
            subTypeName: subType,
            assets: subType.assets,
          });
        })

        types.push({
          typeId: typeId,
          typeName: type,
          subTypes: subTypes,
        })
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
      // await assetService.loanAsset(values);
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