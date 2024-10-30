import React, { createContext, useContext, useEffect, useState } from "react";
import { LoanStep2 } from "./AddAssetStep2";
import { LoanStep1 } from "./AddAssetStep1";
import { useUI } from "../../../context/UIProvider";
import assetService from "../../../services/AssetService";
import { Box } from "@chakra-ui/react";
import { useFormModal } from "../../../context/ModalProvider";
import { v4 as uuidv4 } from 'uuid';

export const createNewType = (type={}) => ({
  'key': uuidv4(),
  'typeId': type.typeId || '',
  'typeName': type.typeName || '',
  'subTypes': (type.subType || [{}]).map(subType => createNewSubType(subType))
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
  'cost': asset.cost || 0,
  'remarks': '',
})

// Create a context
const AddAssetsContext = createContext();

// Create a provider component
export const AddAssetsProvider = ({ children }) => {
  const { setLoading, showToast, handleError } = useUI();
  const { setFormType, initialValues, handleAssetSearch } = useFormModal();
  const [ warnings, setWarnings ] = useState({});

  const [vendorOptions, setVendorOptions] = useState([]);

  const [formData, setFormData] = useState({
    types: [createNewType()],
    signatures: {},
  });
  const [userLoans, setUserLoans] = useState({});
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (initialValues) {
      console.log(initialValues);
      let asset = null;
      if(initialValues.assetId) {
        asset = initialValues;
        setAssetOptions([{value: initialValues.assetId, label: initialValues.assetTag}])
      }
      
      const users = []
      if(initialValues.userId) {
        users.push(initialValues)
        setUserOptions([{value: initialValues.userId, label: initialValues.userName}])
      }
      
      setFormData({
        types: [createNewType(asset, users)],
      });
    }
  }, [initialValues, setFormData]);

  const processAccessories = (accessoryTypesStr) => {
    if (!accessoryTypesStr) return {};
    return accessoryTypesStr.split(',').map(accessoryType => accessoryType.trim()).reduce((acc, accessoryType) => {
      if (acc[accessoryType]) {
        acc[accessoryType] += 1;
      } else {
        acc[accessoryType] = 1;
      }
      return acc;
    }, {});
  };

  const setValuesExcel = async (records) => {
    // CANNOT SEARCH FOR ASSET HERE, MAYBE CAN TRY IN FUTURE TO GET THE UPDATED VALUE
    try {

        const assetTags = new Set();
        const userNames = new Set();
        const accessoryNames = new Set();

        records.forEach(record => {
            // Trim and add asset tags to the set
            record.assetTag = record.assetTag?.trim();
            if (record.assetTag) {
                if (assetTags.has(record.assetTag)) throw new Error(`Duplicate records for assetTag: ${record.assetTag} were found`);
                else assetTags.add(record.assetTag);
            } 
            
            // Process and add user names to the set
            record.userNames = record.userNames 
                ? [...new Set(record.userNames.split(',').map(user => {
                    const trimmedUser = user.trim();
                    userNames.add(trimmedUser); // Add each user to the userNames set
                    return trimmedUser;
                }))]
                : [];
        
            // Process accessoryTypes
            const accessoryTypes = processAccessories(record.accessoryTypes);
            record.accessoryTypes = Object.entries(accessoryTypes).map(([name, count]) => {
                accessoryNames.add(name);
                return { accessoryName: name, count: count };
            });
        });

        const assetResponse = await handleAssetSearch([...assetTags])
        const newAssetOptions = assetResponse.data;

        setAssetOptions(newAssetOptions);
    
        // Convert grouped records into loans
        const loans = records.map(({ assetTag, userNames, accessoryTypes }) => {
            // Find the asset ID based on assetTag
            const matchedAssetOption = newAssetOptions.find(option => option.label === assetTag);
            console.log(matchedAssetOption);
            const assetObj = {
                assetId: matchedAssetOption ? matchedAssetOption.value : null,
                assetTag: assetTag // Pass assetTag regardless of whether id is found
            };
        
            // Create a new loan using the objects with both id and original values
            return createNewLoan(
                assetObj,    // Pass object with assetId and assetTag
            );
        });
    
      console.log(loans);
    
      setFormData({
        loans: loans
      });
    } catch (error) {
      handleError(error);
    }
  };

  const prevStep = () => {
    setStep(step - 1)
  };

  const nextStep = (values, actions) => {
    console.log('Manual Form Values:', values);
    const userLoans = {}
    const signatures = {};

    values.loans.forEach((loan) =>
      loan.users?.forEach((user) => {
        if (!userLoans[user.userId]) {
          userLoans[user.userId] = {}
          userLoans[user.userId].assets = [loan.asset];
          userLoans[user.userId].userName = user.userName;
          signatures[user.userId] = ''
          console.log(signatures);
        } else userLoans[user.userId].assets.push(loan.asset)
      })
    );
    setUserLoans(userLoans);
    setFormData((prevData) => ({
      ...prevData,
      ...values,
      signatures: signatures,
    }));
    setStep(step + 1);
  };

  const handleSubmit = async (values, actions) => {
    setLoading(true);
    console.log('Manual Form Values:', values);
    try {
      await assetService.loanAsset(values);
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
    vendorOptions,
    formData,
    userLoans,
    step,
    setVendorOptions,
    setFormData,
    setUserLoans,
    setStep,
    processAccessories,
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
        <LoanStep1/>
      </Box>
      <Box style={{ display: step === 2 ? 'block' : 'none' }}>
        <LoanStep2/>
      </Box>
    </AddAssetsContext.Provider>
  )
};

// Hook to use the LoanContext in child components
export const useAddAssets = () => {
  return useContext(AddAssetsContext);
};