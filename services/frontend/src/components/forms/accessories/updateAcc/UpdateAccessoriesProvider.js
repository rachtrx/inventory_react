import { Box, Button, Divider, Flex, ModalBody, ModalFooter } from "@chakra-ui/react";
import { useFormModal } from "../../../../context/ModalProvider";
import { FieldArray, Form, Formik } from "formik";
import { useUI } from "../../../../context/UIProvider";
import { ResponsiveText } from "../../../utils/ResponsiveText";
import accessoryService from "../../../../services/AccessoryService";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useLoading } from "../../../../context/LoadingProvider";
import { UpdateAccessory } from "./UpdateAccessory";
import { createNewAccessory } from "./helpers";
import { UpdateAccessoriesStep1 } from "./UpdateAccessoriesStep1";
import { UpdateAccessoriesStep2 } from "./UpdateAccessoriesStep2";
import loanService from "../../../../services/LoanService";
import { compareStrings } from "../../utils/validation";

const UpdateAccessoriesContext = createContext();

export const UpdateAccessoriesProvider = () => {

  // console.log('update acc form rendered');

  const { setFormType, initialValues, reinitializeForm, triggerRefresh } = useFormModal()
  const { showToast, handleError } = useUI();
  const { setLoading } = useLoading();
  const [formData, setFormData] = useState({
    accessories: [createNewAccessory()]
  });
  const [step, setStep] = useState(1);
  const [accessoryOptions, setAccessoryOptions] = useState([]);
  
  useEffect(() => {
    console.log(initialValues);
    if (!initialValues.accTypeIds?.length) return;

    const setValues = async() => {
      const response = await loanService.fetchAccLoanById([...initialValues.accTypeIds]);
      const options = response.data;

      const accTypes = initialValues.accTypeIds.map(accTypeId => {
        const matchedOption = options.find(option => compareStrings(option.accessoryTypeId, accTypeId))
        if (!matchedOption) throw new Error("Accessory not found");
        else return matchedOption;
      })

      setAccessoryOptions(options);
      reinitializeForm({accessories: accTypes.map(accType => createNewAccessory(accType))})
    }
    setValues();
    
  }, [initialValues, reinitializeForm])

  const setValuesExcel = async (records) => {
    const accessoryNames = new Set();

    records.forEach(record => {
      Object.keys(record).forEach(field => {
        record[field] = record[field]?.toString().trim()
        if (field === 'change') {
          try {
            record[field] = parseInt(record[field], 10);
          } catch {
            throw new Error(`Unable to convert value ${record[field]} to an integer`)
          }
        }
      });

      ['accessoryName', 'change'].forEach(field => {
        if (!record[field]) throw new Error(`Missing ${field} at line ${record.__rowNum__}`);
      });

      let { accessoryName, change } = record;

      if (accessoryNames.has(accessoryName)) throw new Error(`Duplicate records for accessory name: ${accessoryName} were found`);
      else accessoryNames.add(accessoryName);

      if (change === 0) throw new Error(`Change for accessory name: ${accessoryName} cannot be 0`);
    })

    const response = await loanService.fetchAccLoan(Array.from(accessoryNames));
    const options = response.data;

    const accessories = records.map(({ accessoryName, change }) => {
      const accessory = options.find(option => compareStrings(option.value, accessoryName));
      if (accessory) return { ...accessory, count: change }
      else return { accessoryName, count: change }
    })

    setAccessoryOptions(options);
    
    reinitializeForm({
      accessories: accessories.map(acc => createNewAccessory(acc))
    })
  }

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

  const prevStep = () => {
    setStep(step - 1)
  };

  const nextStep = (values) => {
    setFormData((prevData) => ({
      ...prevData,
      ...values
    }));
    setStep(step + 1);
  };

  const value = {
    accessoryOptions,
    addNewAccessory,
    formData,
    step,
    setFormData,
    setStep,
    setValuesExcel,
    prevStep,
    nextStep,
    handleSubmit
  };
  
  return (
    <UpdateAccessoriesContext.Provider value={value}>
      <Box style={{ display: step === 1 ? 'block' : 'none' }}>
        <UpdateAccessoriesStep1/>
      </Box>
      <Box style={{ display: step === 2 ? 'block' : 'none' }}>
        <UpdateAccessoriesStep2/>
      </Box>
    </UpdateAccessoriesContext.Provider>
  );
};

export const useUpdateAccessories = () => {
  return useContext(UpdateAccessoriesContext);
};