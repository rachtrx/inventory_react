import { createContext, useContext, useEffect, useState } from "react";
import { useUI } from "../../../context/UIProvider";
import assetService from "../../../services/AssetService";
import { createNewLoan, createNewUser } from "./helpers";
import { useForm } from "../../../context/FormProvider";
import accessoryService from "../../../services/AccessoryService";
import { useLoading } from "../../../context/LoadingProvider";
import loanService from "../../../services/LoanService";
import { use } from "react";

// Create a context
const LoansContext = createContext();

// Create a provider component
export const LoansProvider = ({ children }) => {
  const { showToast, handleError } = useUI();
  const { setLoading } = useLoading();
  const { setFormType, initialValues, triggerRefresh, reinitializeForm } = useForm();
  const [ sTypeAccMap, setSTypeAccMap ] = useState({});

  const [locationOptions, setLocationOptions] = useState([]);
  const [assetOptions, setAssetOptions] = useState([]);
  const [userOptions, setUserOptions] = useState([]);
  const [accessoryOptions, setAccessoryOptions] = useState([]);
  const [accessoryOptionsReady, setAccessoryOptionsReady] = useState(false);

  useEffect(() => {
    const fetchLocations = async () => {
      const locationResponse = await assetService.getFilters('location');
      const locationFilters = locationResponse.data;
      setLocationOptions(locationFilters);
    };
    fetchLocations();
  }, []);

  useEffect(() => {
    const fetchAccessories = async() => {
      const response = await loanService.fetchAccLoan();
      const options = response.data;
      setAccessoryOptions(options);
      setAccessoryOptionsReady(true);
    }
    fetchAccessories();
  }, [])

  useEffect(() => {
    console.log(initialValues);
    if (
      !initialValues?.assetIds?.length && 
      !initialValues?.userIds?.length &&
      !initialValues?.accTypeIds?.length
    ) return;

    if (!accessoryOptionsReady && initialValues?.accTypeIds?.length) return;

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

    const fetchAccLoans = () => {
      const accessories = initialValues.accTypeIds.map(accTypeId => {
        console.log(accessoryOptions);
        const matchedAccOption = accessoryOptions.find(accTypeOption => accTypeOption.accessoryTypeId === accTypeId);
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
    
  }, [initialValues, handleError, reinitializeForm, accessoryOptions]);

  const addNewAccessory = async (accessoryName) => {
    try {
      setLoading(true);
      const response = await accessoryService.createAccessory(accessoryName);
      const newOption = { 
        accessoryTypeId: response.data.newAccType.accessoryTypeId,
        accessoryName: response.data.newAccType.accessoryName,
        stock: response.data.newAccType.stock,
        value: response.data.newAccType.accessoryName,
        label: response.data.newAccType.accessoryName
      }
      setLoading(false);
      return newOption;
    } catch (error) {
      setLoading(false);
      handleError(error);
    }
  }

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
    addNewAccessory,
    setAssetOptions,
    setUserOptions,
    setAccessoryOptions,
    setLocationOptions,
    handleSubmit,
    sTypeAccMap,
    setSTypeAccMap
  };

  return (
    <LoansContext.Provider value={value}>
      {children}
    </LoansContext.Provider>
  )
};

// Hook to use the LoanContext in child components
export const useLoans = () => {
  return useContext(LoansContext);
};