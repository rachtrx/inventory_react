import React, { createContext, useContext, useEffect, useState } from "react";
import { AddAssetTagsStep2 } from "./addTag/AddAssetTagsStep2";
import { AddAssetTagsStep1 } from "./addTag/AddAssetTagsStep1";
import { useUI } from "../../../../context/UIProvider";
import assetService from "../../../../services/AssetService";
import { Box } from "@chakra-ui/react";
import { useFormModal } from "../../../../context/ModalProvider";
import { v4 as uuidv4 } from 'uuid';
import { compareStrings, convertExcelDate } from "../../utils/validation";
import { DelAssetTagsStep1 } from "./delTag/DelAssetTagsStep1";
import { DelAssetTagsStep2 } from "./delTag/DelAssetTagsStep2";
import { useLoading } from "../../../../context/LoadingProvider";

export const createNewTag = (tag=null, assets=[]) => ({
	'key': uuidv4(),
	'tagId': tag?.tagId || '',
	'tagName': tag?.tagName || '',
	'assets': assets.length !== 0 ? assets.map(asset => createNewAsset(asset)) : []
})

export const createNewAsset = (asset={}) => ({
	'key': uuidv4(),
	'serialNumber': asset.serialNumber || '',
	'assetId': asset.assetId || '',
  'remarks': asset.remarks || '',
	'assetTagId': asset.tags?.find(tag => tag.isMatching)?.assetTagId || '',
})

// Create a context
const AssetTagsContext = createContext();

// Create a provider component
export const AssetTagsFormProvider = ({
	fetchAstForTagsFunc,
	Step1,
	Step2
}) => {
  const { showToast, handleError } = useUI();
  const { setLoading } = useLoading();
  const { setFormType, initialValues } = useFormModal();
  const [ warnings, setWarnings ] = useState({});

  const [ tagOptions, setTagOptions ] = useState([]);
  const [ assetOptions, setAssetOptions ] = useState({});

  const [formData, setFormData] = useState({
    tags: [createNewTag()],
  });
  const [step, setStep] = useState(1);

  // useEffect(() => {
  //   console.log(tagOptions);
  // }, [tagOptions])

  useEffect(() => {
    const loadAssets = async (serialNumbers) => {
      const response = await fetchAstForTagsFunc(serialNumbers);
      
    }
  }, [initialValues])

  useEffect(() => { 
    const fetchFilters = async () => {
      const tagFilters = await getTagFilters();
      setTagOptions(tagFilters);
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

  const setValuesExcel = async (records) => {
    // CANNOT SEARCH FOR ASSET HERE, MAYBE CAN TRY IN FUTURE TO GET THE UPDATED VALUE
    try {
      const recordsMap = {};
      const snDict = {}; // serial number dictionary for <tag: usernames>

      records.forEach((record) => {
        ['tag', 'serialNumber'].forEach(field => {
          if (!record[field]) throw new Error(`Missing ${field} at line ${record.__rowNum__}`);
        });

        const { tag, serialNumber, remarks="" } = record;

        if (!snDict[tag]) {
          snDict[tag] = new Set();
        }

        if (snDict[tag].has(serialNumber)) throw new Error(`Duplicate records for Serial Number: ${serialNumber} were found`);
        else snDict[tag].add(serialNumber);

        if (!recordsMap[tag]) {
          recordsMap[tag] = [];
        }
        
        recordsMap[tag].push({serialNumber, remarks});
      });
      const tags = [];

      for (const [ tagName, assetRows ] of Object.entries(recordsMap)) {
        const serialNumbers = snDict[tagName]

        let tagOption = tagOptions.find(option => compareStrings(option.value, tagName));
        let newAssetOptions;
        let response;

        if (!tagOption) {
          tagOption = { tagName }
          response = await fetchAstForTagsFunc([...serialNumbers])
        } else {
          response = await fetchAstForTagsFunc([...serialNumbers], tagOption.tagId) 
        }
        newAssetOptions = response.data;
        setAssetOptions({ ...assetOptions, [tagName]: newAssetOptions });
        // console.log(newAssetOptions);

        const assetObjs = assetRows.map(({serialNumber, remarks}) => {
          const matchedAssetOption = newAssetOptions.find(option => compareStrings(option.value, serialNumber));
          // console.log(matchedAssetOption);
          if (matchedAssetOption) return { ...matchedAssetOption, remarks};
          return {serialNumber, remarks};
        })

        tags.push(createNewTag(tagOption, assetObjs));
      }

      // console.log(tags);
    
      setFormData({
        tags: tags
      });

    } catch (error) {
      handleError(error);
    }
  };

  const prevStep = () => {
    setStep(step - 1)
  };

  const nextStep = (values) => {
    // console.log(values);
    setStep(step + 1);

    setFormData((prevData) => ({
      ...prevData,
      ...values
    }));
  };

  const handleAddTagsSubmit = async (values, actions) => {
    setLoading(true);
    try {
      await assetService.tagAsset(values);
      actions.setSubmitting(false);
      setLoading(false);
      showToast('Assets successfully tagged', 'success', 500);
      setFormType(null);
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
    formData,
    assetOptions, 
    setAssetOptions,
    step,
    setFormData,
    setStep,
    setValuesExcel,
    prevStep,
    nextStep,
    handleAddTagsSubmit,
    handleDelTagsSubmit,
    warnings,
    setWarnings
  };

  return (
    <AssetTagsContext.Provider value={value}>
      <Box style={{ display: step === 1 ? 'block' : 'none' }}>
        <Step1/>
      </Box>
      <Box style={{ display: step === 2 ? 'block' : 'none' }}>
        <Step2/>
      </Box>
    </AssetTagsContext.Provider>
  )
};

// Hook to use the LoanContext in child components
export const useAssetTags = () => {
  return useContext(AssetTagsContext);
};

export const AddAssetTagsProvider = ({ children }) => (
  <AssetTagsFormProvider
    fetchAstForTagsFunc={assetService.fetchTagAsset}
		Step1={AddAssetTagsStep1}
		Step2={AddAssetTagsStep2}
  >
    {children}
  </AssetTagsFormProvider>
);

export const DelAssetTagsProvider = ({ children }) => (
  <AssetTagsFormProvider
    fetchAstForTagsFunc={assetService.fetchUntagAsset}
		Step1={DelAssetTagsStep1}
		Step2={DelAssetTagsStep2}
  >
    {children}
  </AssetTagsFormProvider>
);