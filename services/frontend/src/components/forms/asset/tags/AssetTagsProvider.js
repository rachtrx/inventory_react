import { createContext, useContext, useEffect, useState } from "react";
import { useUI } from "../../../../context/UIProvider";
import assetService from "../../../../services/AssetService";
import { FormType, useForm } from "../../../../context/FormProvider";
import { useLoading } from "../../../../context/LoadingProvider";
import { createNewTag } from "./helpers";

// Create a context
const AssetTagsContext = createContext();

// Create a provider component
export const AssetTagsFormProvider = ({ children }) => {
  const { showToast, handleError } = useUI();
  const { setLoading } = useLoading();
  const { formType, setFormType, initialValues, triggerRefresh, reinitializeForm } = useForm();

  const [ tagOptions, setTagOptions ] = useState([]);
  const [ newTagOptions, setNewTagOptions ] = useState([]);

  const [ assetOptions, setAssetOptions ] = useState([]);


  useEffect(() => {
    if (!initialValues?.tagIds || !initialValues?.assetIds || !tagOptions.length ) return;
    if (formType !== FormType.TAG_ASSET && formType !== FormType.UNTAG_ASSET) return;
    
    const loadAssets = async () => {
      const tagMap = Object.fromEntries(tagOptions.map(tag => [tag.tagId, tag]));

      const tags = [];
      let response;
      if (formType === FormType.TAG_ASSET) response = await assetService.fetchTagAssetById(initialValues.assetIds);
      else response = await assetService.fetchUntagAssetById(initialValues.assetIds);

      const newAssetOptions = response.data;

      for (const tagId of initialValues.tagIds) {
        const tagOption = tagMap[tagId];
        console.log(response.data);
        tags.push(createNewTag(tagOption, newAssetOptions));
      }

      setAssetOptions(newAssetOptions);
      reinitializeForm({ tags });
    };
    loadAssets()
  }, [initialValues, reinitializeForm, formType, tagOptions])

  useEffect(() => {
    const fetchFilters = async () => {
      const tagFilters = await getTagFilters();
      setTagOptions(tagFilters);
      console.log(tagFilters);
    };
    fetchFilters();
  }, []);

  const getTagFilters = async () => {
      const response = await assetService.getFilters('assetTag');
      const options = response.data;
      return options.map(option => ({
          value: option.label,
          label: option.label,
          tagId: option.id,
          tagName: option.label
      }));
  };

  const addNewTag = async (tagName) => {
    try {
      setLoading(true);
      const response = await assetService.createNewTag(tagName);
      setLoading(false);
      const newTag = { 
        tagId: response.data.data.id,
        value: response.data.data.tagName,
        label: response.data.data.tagName
      }
      return newTag
    } catch (error) {
      setLoading(false);
      handleError(error);
    }
  }

  const handleAddTagsSubmit = async (values, actions) => {
    setLoading(true);
    try {
      await assetService.tagAsset(values);
      actions.setSubmitting(false);
      setLoading(false);
      showToast('Assets successfully tagged', 'success', 500);
      setFormType(null);
      triggerRefresh();;
    } catch (err) {
      console.error(err);
      handleError(err);
      console.error("Error Handled");
      setLoading(false);
    }
  };
  
  const handleDelTagsSubmit = async (values, actions) => {
    setLoading(true);
    try {
      await assetService.untagAsset(values);
      actions.setSubmitting(false);
      setLoading(false);
      showToast('Assets successfully untagged', 'success', 500);
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
    tagOptions,
    setTagOptions,
    newTagOptions, 
    setNewTagOptions,
    addNewTag,
    assetOptions, 
    setAssetOptions,
    handleAddTagsSubmit,
    handleDelTagsSubmit,
  };

  return (
    <AssetTagsContext.Provider value={value}>
      {children}
    </AssetTagsContext.Provider>
  )
};

// Hook to use the LoanContext in child components
export const useAssetTags = () => {
  return useContext(AssetTagsContext);
};
