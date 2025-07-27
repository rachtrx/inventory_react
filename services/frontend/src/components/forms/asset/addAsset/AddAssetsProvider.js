import React, { createContext, useContext, useEffect, useState } from "react";
import { AddAssetStep2 } from "./AddAssetStep2";
import { AddAssetStep1 } from "./AddAssetStep1";
import { useUI } from "../../../../context/UIProvider";
import assetService from "../../../../services/AssetService";
import { Box } from "@chakra-ui/react";
import { useForm } from "../../../../context/FormProvider";
import { compareStrings, convertExcelDate } from "../../utils/validation";
import { useLoading } from "../../../../context/LoadingProvider";
import { createNewSubType, createNewType } from "./helpers";

// Create a context
const AddAssetsContext = createContext();

// Create a provider component
export const AddAssetsProvider = ({ children }) => {
  const { showToast, handleError } = useUI();
  const { setLoading } = useLoading();
  const { setFormType, triggerRefresh } = useForm();

  const [vendorOptions, setVendorOptions] = useState([]);
  const [typeOptions, setTypeOptions] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);
  const [subTypeOptionsDict, setSubTypeOptionsDict] = useState([]);

  useEffect(() => {
    // console.log(typeOptions);
    // console.log(vendorOptions);
  }, [typeOptions, vendorOptions])

  useEffect(() => {
    const fetchFilters = async () => {
        const typeFilters = await getTypeFilters();
        const vendorFilters = await getVendorFilters();
        const locationResponse = await assetService.getFilters('location');
        const locationFilters = locationResponse.data;
        
        setTypeOptions(typeFilters);
        setVendorOptions(vendorFilters);
        setLocationOptions(locationFilters);
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

  const addNewType = async (typeName) => {
    try {
      setLoading(true);
      const response = await assetService.createNewType(typeName);
      setTypeOptions(oldArray => [
        ...oldArray.filter(item => !(item.value === typeName && !item.typeId)),
        { 
          typeId: response.data.data.id, 
          value: response.data.data.typeName, 
          label: response.data.data.typeName 
        }
      ]);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      handleError(error);
    }
  }

  const addNewVendor = async (vendorName) => {
    try {
      setLoading(true);
      const response = await assetService.createNewVendor(vendorName);
      setVendorOptions(oldArray => [
        ...oldArray.filter(item => !(item.value === vendorName && !item.vendorId)),
        { 
          vendorId: response.data.data.id, 
          value: response.data.data.vendorName, 
          label: response.data.data.vendorName 
        }
      ]);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      handleError(error);
    }
  }

  const addNewSubType = async (subTypeName, typeId) => {
    try {
      setLoading(true);
      const response = await assetService.createNewSubType(subTypeName, typeId);
      const { data: newSubType } = response.data;

      setSubTypeOptionsDict((oldDict) => ({
        ...oldDict,
        [typeId]: [
          ...(oldDict[typeId] || []), // Preserve existing subtypes for the typeId
          { 
            subTypeId: newSubType.id,
            value: newSubType.subTypeName, 
            label: newSubType.subTypeName 
          }
        ]
      }));
      setLoading(false);
    } catch (error) {
      setLoading(false);
      handleError(error);
    }
  }

  const handleSubmit = async (values, actions) => {
    setLoading(true);
    // console.log('Manual Form Values:', values);
    try {
      await assetService.addAsset(values);
      actions.setSubmitting(false);
      setLoading(false);
      showToast('Assets successfully added', 'success', 500);
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
    typeOptions,
    vendorOptions,
    locationOptions,
    subTypeOptionsDict,
    setSubTypeOptionsDict,
    createNewSubType,
    addNewSubType,
    addNewType,
    addNewVendor,
    handleSubmit
  };

  return (
    <AddAssetsContext.Provider value={value}>
      {children}
    </AddAssetsContext.Provider>
  )
};

// Hook to use the LoanContext in child components
export const useAddAssets = () => {
  return useContext(AddAssetsContext);
};