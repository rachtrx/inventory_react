import { createContext, useContext, useEffect, useState } from "react";
import { DelAssetStep2 } from "./DelAssetStep2";
import { DelAssetStep1 } from "./DelAssetStep1";
import { useUI } from "../../../../context/UIProvider";
import assetService from "../../../../services/AssetService";
import { Box } from "@chakra-ui/react";
import { useForm } from "../../../../context/FormProvider";
import { useLoading } from "../../../../context/LoadingProvider";
import { delNewAsset } from "./helpers";

// Create a context
const DelAssetsContext = createContext();

// Create a provider component
export const DelAssetsProvider = ({ children }) => {
  const { showToast, handleError } = useUI();
  const { setLoading } = useLoading();
  const { setFormType, initialValues, triggerRefresh, reinitializeForm } = useForm();

  const [assetOptions, setAssetOptions] = useState([]);

  useEffect(() => {
    if (!initialValues?.assetIds?.length) return;

    const fetchAstDeletes = async () => {
      try {
        const assetResponse = await assetService.fetchAstDelById(initialValues.assetIds);
        setAssetOptions(assetResponse.data);
  
        const assetObjs = initialValues.assetIds.map(assetId => {
          const matchedAssetOption = assetResponse.data.find(assetOption => assetOption.assetId === assetId);
          if (!matchedAssetOption) throw new Error(`Asset not found`)
          else if (matchedAssetOption.isDisabled) throw new Error(`Asset cannot be condemned`)
          else return matchedAssetOption;
        })
        const assets = assetObjs.map(asset => {
          return delNewAsset(asset);
        })
        reinitializeForm({assets});
      } catch(err) {
        handleError(err);
      }
    }
    fetchAstDeletes()
  }, [initialValues, reinitializeForm, handleError]);

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
    setAssetOptions,
    handleSubmit
  };

  return (
    <DelAssetsContext.Provider value={value}>
      {children}
    </DelAssetsContext.Provider>
  )
};

// Hook to use the LoanContext in child components
export const useDelAssets = () => {
  return useContext(DelAssetsContext);
};