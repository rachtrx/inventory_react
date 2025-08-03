import { Box, Button, Divider, Flex, ModalBody, ModalFooter } from "@chakra-ui/react";
import { useForm } from "../../../../context/FormProvider";
import { useUI } from "../../../../context/UIProvider";
import accessoryService from "../../../../services/AccessoryService";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useLoading } from "../../../../context/LoadingProvider";
import { UpdateAccessory } from "./UpdateAccessory";
import { createNewAccessory } from "./helpers";
import { UpdateAccessoryStep1 } from "./UpdateAccessoryStep1";
import { UpdateAccessoryStep2 } from "./UpdateAccessoryStep2";
import loanService from "../../../../services/LoanService";
import { compareStrings } from "../../utils/validation";

const UpdateAccessoriesContext = createContext();

export const UpdateAccessoriesProvider = ({ children }) => {

  // console.log('update acc form rendered');

  const { setFormType, initialValues, reinitializeForm, triggerRefresh } = useForm()
  const { showToast, handleError } = useUI();
  const { setLoading } = useLoading();
  const [accessoryOptions, setAccessoryOptions] = useState(null);

  useEffect(() => {
    const fetchAccessories = async() => {
      const response = await loanService.fetchAccLoan();
      const options = response.data;
      setAccessoryOptions(options);
    }
    fetchAccessories();
  }, [])
  
  useEffect(() => {
    console.log(initialValues);
    if (!initialValues?.accTypeIds?.length || !accessoryOptions) return;

    const setValues = async() => {

      const accTypes = initialValues.accTypeIds.map(accTypeId => {
        const matchedOption = accessoryOptions.find(option => compareStrings(option.accessoryTypeId, accTypeId))
        if (!matchedOption) throw new Error("Accessory not found");
        else return matchedOption;
      })

      reinitializeForm({accessories: accTypes.map(accType => createNewAccessory(accType))})
    }
    setValues();
  }, [initialValues, reinitializeForm, accessoryOptions])

  const handleSubmit = async (values, actions) => {
    setLoading(true);
    // console.log('Manual Form Values:', values);
    try {
      await accessoryService.addAccessories(values);
      actions.setSubmitting(false);
      setLoading(false);
      showToast('Accessories successfully loaned', 'success', 500);
      setFormType(null);
      triggerRefresh();
    } catch (err) {
      console.error(err);
      handleError(err);
      console.error("Error Handled");
      setLoading(false);
    }
  };

  const addNewAccessory = async (accessoryName) => {
    try {
      setLoading(true);
      const response = await accessoryService.createAccessory(accessoryName);
      const newAcc = {
        accessoryTypeId: response.data.newAccType.accessoryTypeId,
        accessoryName: response.data.newAccType.accessoryName,
        stock: response.data.newAccType.stock,
        value: response.data.newAccType.accessoryName,
        label: response.data.newAccType.accessoryName
      }
      setLoading(false);
      return newAcc;
    } catch (error) {
      setLoading(false);
      handleError(error);
    }
  }

  const value = {
    accessoryOptions,
    setAccessoryOptions,
    addNewAccessory,
    handleSubmit
  };
  
  return (
    <UpdateAccessoriesContext.Provider value={value}>
      {children}
    </UpdateAccessoriesContext.Provider>
  );
};

export const useUpdateAccessories = () => {
  return useContext(UpdateAccessoriesContext);
};