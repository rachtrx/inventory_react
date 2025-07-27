import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { LoanStep2 } from "./LoanStep2";
import { LoanStep1 } from "./LoanStep1";
import { useUI } from "../../../context/UIProvider";
import assetService from "../../../services/AssetService";
import { createNewAccessory, createNewAsset, createNewLoan, createNewUser } from "./helpers";
import { Box } from "@chakra-ui/react";
import { useFormModal } from "../../../context/ModalProvider";
import { compareStrings, convertExcelDate } from "../utils/validation";
import accessoryService from "../../../services/AccessoryService";
import { useLoading } from "../../../context/LoadingProvider";
import loanService from "../../../services/LoanService";
import { useLocation } from 'react-router-dom';

// Create a context
const LoansContext = createContext();

// Create a provider component
export const LoansProvider = () => {
  const { showToast, handleError } = useUI();
  const { setLoading } = useLoading();
  const { setFormType, initialValues, triggerRefresh, reinitializeForm } = useFormModal();
  const [step, setStep] = useState(1);
  const [ sTypeAccMap, setSTypeAccMap ] = useState({});

  const [locationOptions, setLocationOptions] = useState([]);
  const [assetOptions, setAssetOptions] = useState([]);
  const [userOptions, setUserOptions] = useState([]);
  const [accessoryOptions, setAccessoryOptions] = useState([]);

  const location = useLocation();
  const initialUser = useMemo(() => {
    if (location.pathname.includes('assets')) {
      return createNewUser({loans: [{ asset: createNewAsset(), accessories: [] }]});
    } else if (location.pathname.includes('accessories')) {
      return createNewUser({loans: [{ asset: null, accessories: [createNewAccessory()] }]});
    } else {
      return createNewUser();
    }
  }, [location.pathname]);
  
  const [formData, setFormData] = useState({
    users: [initialUser]
  });

  useEffect(() => {
    const fetchLocations = async () => {
      const locationResponse = await assetService.getFilters('location');
      const locationFilters = locationResponse.data;
      setLocationOptions(locationFilters);
    };
    fetchLocations();
  }, []);

  useEffect(() => {
    console.log(initialValues);
    if (
      !initialValues?.assetIds?.length && 
      !initialValues?.userIds?.length &&
      !initialValues?.accTypeIds?.length
    ) return;

    const fetchAstLoans = async () => {
      const assetResponse = await loanService.fetchAstLoanById(initialValues.assetIds);
      console.log(assetResponse.data);
      setAssetOptions(assetResponse.data);

      const assetObjs = initialValues.assetIds.map(assetId => {
        const matchedAssetOption = assetResponse.data.find(assetOption => assetOption.assetId === assetId);
        if (!matchedAssetOption) throw new Error(`Asset with ID ${assetId} not found`)
        else return matchedAssetOption;
      })
      
      if (initialValues.user) {
        const userResponse = await loanService.fetchUserLoanById(initialValues.user.userId);
        setUserOptions(userResponse.data);
        const loans = assetObjs.map(asset => ({ asset }))
        reinitializeForm({
          users: [createNewUser({ ...initialValues.user, loans })]
        });
      } else {
        const users = assetObjs.map(asset => createNewUser({ loans: [{ asset }] }))
        reinitializeForm({ users });
      }
    }

    const fetchUserLoans = async () => {
      const userResponse = await loanService.fetchUserLoanById(initialValues.userIds);
      setUserOptions(userResponse.data);
      
      const userObjs = initialValues.userIds.map(userId => {
        const matchedUserOption = userResponse.data.find(userOption => userOption.userId === userId);
        if (!matchedUserOption) throw new Error(`User with ID ${userId} not found`)
        else return matchedUserOption;
      })
      const users = userObjs.map(user => createNewUser(user));
      reinitializeForm({ users });
    }

    const fetchAccLoans = async() => {
      const accResponse = await loanService.fetchAccLoanById(initialValues.accTypeIds);
      setAccessoryOptions(accResponse.data);

      const accessories = initialValues.accTypeIds.map(accTypeId => {
        const matchedAccOption = accResponse.data.find(accTypeOption => accTypeOption.accessoryTypeId === accTypeId);
        if (!matchedAccOption) throw new Error(`Accessory with ID ${accTypeId} not found`)
        else return matchedAccOption;
      })

      const users = [createNewUser({ loans: [createNewLoan({ accessories })] })]
      reinitializeForm({ users });
    }

    try {
      if (initialValues.assetIds) {
        fetchAstLoans();
      } else if (initialValues.userIds) {
        fetchUserLoans();
      } else if (initialValues.accTypeIds) {
        fetchAccLoans();
      }
    } catch (err) {
      handleError(err);
    }
    
  }, [initialValues, handleError, reinitializeForm]);

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
      const serialNumbers = new Set();
      const userNames = new Set();
      const accessoryNames = new Set();

      const userToRowMap = {};

      records.forEach((record, idx) => {
        // Process and add user names to the set
        if (!record.userName) throw new Error (`Username required at line ${record.__rowNum__}`)
        record.userName = record.userName.trim();
        userNames.add(record.userName);

        if (!record.serialNumber) throw new Error (`Serial Number required at line ${record.__rowNum__}`)

        if (typeof record.serialNumber === 'number') {
          record.serialNumber = record.serialNumber.toString();
        }
        record.serialNumber = record.serialNumber.trim();
        if (record.serialNumber) {
            if (serialNumbers.has(record.serialNumber)) throw new Error(`Duplicate records for serialNumber: ${record.serialNumber} were found`);
            else serialNumbers.add(record.serialNumber);
        } else throw new Error (`Serial Number required at line ${record.__rowNum__}`)
    
        // Process accessoryTypes
        const accessoryTypes = processAccessories(record.accessoryTypes);
        record.accessoryTypes = Object.entries(accessoryTypes).map(([name, count]) => {
            accessoryNames.add(name);
            return { accessoryName: name, count: count };
        });
        
        if (record.expectedReturnDate) {
          record.expectedReturnDate = convertExcelDate(record.expectedReturnDate);
        }

        if (!userToRowMap[record.userName]) userToRowMap[record.userName] = [idx];
        else userToRowMap[record.userName].push(idx);
      });

      const assetResponse = await loanService.fetchAstLoan([...serialNumbers]);
      console.log(assetResponse.data);
      const userResponse = await loanService.fetchUserLoan([...userNames]);
      const newAssetOptions = assetResponse.data;
      const newUserOptions = userResponse.data;

      let newAccessoryoptions = [];
      console.log(accessoryNames);
      if (accessoryNames.size !== 0) {
        const accessoryResponse = await loanService.fetchAccLoan([...accessoryNames]);
        newAccessoryoptions = accessoryResponse.data;
        console.log(newAccessoryoptions);
      }
  
      // Convert grouped records into loans
      const users = Object.entries(userToRowMap).map(([userName, rowIdxs]) => {

        // Find the user IDs based on userNames (assuming userNames is an array of names)
        const matchedUserOption = newUserOptions.find(option => compareStrings(option.value, userName));
        console.log(matchedUserOption);
        let userObj;
        if (!matchedUserOption || matchedUserOption.isDisabled) userObj = {userName}
        else userObj = matchedUserOption;

        userObj.loans = []
        
        for (const rowIdx of rowIdxs) {
          const { serialNumber, accessoryTypes, expectedReturnDate, location, remarks } = records[rowIdx];

          const matchedAssetOption = newAssetOptions.find(option => compareStrings(option.value, serialNumber));
          console.log(matchedAssetOption);
          
          let assetObj;
          
          if (!matchedAssetOption || matchedAssetOption.isDisabled) assetObj = {serialNumber: serialNumber}
          else assetObj = matchedAssetOption; // Pass serialNumber regardless of whether id is found
          assetObj.location = location || "";

          const accessoryObjs = accessoryTypes.map(({accessoryName, count}) => {
            const matchedAccessoryOption = newAccessoryoptions.find(option => compareStrings(option.value, accessoryName));
            return matchedAccessoryOption || {
              accessoryName, // Pass accessoryName regardless of whether id is found
              count: count
            }
          });
          console.log(accessoryObjs);

          userObj.loans.push({
            asset: assetObj,
            accessories: accessoryObjs,
            expectedReturnDate: expectedReturnDate,
            remarks: remarks
          })
        }
        return userObj;
      })

      setAssetOptions(newAssetOptions.filter(option => !option.isDisabled));
      setUserOptions(newUserOptions.filter(option => !option.isDisabled));
      setAccessoryOptions(newAccessoryoptions);
    
      reinitializeForm({
        users: users.map(user => createNewUser(user))
      });
    } catch (error) {
      handleError(error);
    }
  };

  const prevStep = () => {
    setStep(step - 1)
  };

  const addNewAccessory = async (accessoryName) => {
    try {
      setLoading(true);
      const response = await accessoryService.createAccessory(accessoryName);
      setAccessoryOptions(oldArray => [
        ...oldArray.filter(item => !(item.value === accessoryName && !item.accessoryTypeId)),
        { 
          accessoryTypeId: response.data.newAccType.accessoryTypeId,
          accessoryName: response.data.newAccType.accessoryName,
          stock: response.data.newAccType.stock,
          value: response.data.newAccType.accessoryName,
          label: response.data.newAccType.accessoryName
        }
      ]);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      handleError(error);
    }
  }

  useEffect(() => {console.log(accessoryOptions)}, [accessoryOptions]);

  const nextStep = (values, actions) => {
    console.log('Manual Form Values:', values);
    setFormData(values);
    setStep(step + 1);
  };

  const handleSubmit = async (values, actions) => {
    setLoading(true);
    console.log('Manual Form Values:', values);
    try {
      await loanService.loanItems(values);
      actions.setSubmitting(false);
      setLoading(false);
      showToast('Assets successfully loaned', 'success', 500);
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
    userOptions,
    accessoryOptions,
    locationOptions,
    formData,
    addNewAccessory,
    step,
    setAssetOptions,
    setUserOptions,
    setAccessoryOptions,
    setFormData,
    setStep,
    processAccessories,
    setValuesExcel,
    prevStep,
    nextStep,
    handleSubmit,
    sTypeAccMap,
    setSTypeAccMap
  };

  return (
    <LoansContext.Provider value={value}>
      {/* Step 1: always mounted, just hidden when not active */}
      <Box hidden={step !== 1}>
        <LoanStep1 />
      </Box>

      {/* Step 2: only render/mount when needed */}
      {step === 2 && <LoanStep2 />}
    </LoansContext.Provider>
  )
};

// Hook to use the LoanContext in child components
export const useLoans = () => {
  return useContext(LoansContext);
};