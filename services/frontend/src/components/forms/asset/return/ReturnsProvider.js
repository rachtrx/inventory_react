import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useUI } from "../../../../context/UIProvider";
import { Box } from "@chakra-ui/react";
import { useFormModal } from "../../../../context/ModalProvider";
import { createNewAccessory, createNewReturn } from "./ReturnSearch";
import ReturnStep1 from "./ReturnStep1";
import { ReturnStep2 } from "./ReturnStep2";
import { compareStrings, convertExcelDate } from "../../utils/validation";
import { useLoading } from "../../../../context/LoadingProvider";
import loanService from "../../../../services/LoanService";
import { useItems } from "../../../../context/ItemsProvider";

// Create a context
const ReturnsContext = createContext();

// Create a provider component
export const ReturnsProvider = ({ children }) => {
  const { showToast, handleError } = useUI();
  const { reload } = useItems();
  const { setLoading } = useLoading();
  const { setFormType, initialValues } = useFormModal();
  const [ warnings, setWarnings ] = useState({});
  const [ returnOptions, setReturnOptions ] = useState([]);
  const [ userOptions, setUserOptions ] = useState([]);

  const [formData, setFormData] = useState({
    returns: [createNewReturn()],
  });
  const [step, setStep] = useState(1);

  useEffect(() => console.log(formData), [formData])

  useEffect(() => {
    console.log(initialValues);
    if (!initialValues || Object.entries(initialValues).length === 0) return;

    const loadPresetValues = async () => {
      try {
        console.log(initialValues);
        
        const response = await loanService.fetchReturns(initialValues);
        console.log(response.data);

        const loans = response.data;

        const newReturns = initialValues.map(loanId => {
          const _return = loans.find(loan => loan.loanId === loanId);

          if (_return.astLoan?.returnEventId && _return.accLoans?.every(accLoan => accLoan.unreturned === 0)) {
            return createNewReturn({
              loanId: _return.loanId,
            })
          } else {
            return createNewReturn({
              loanId: _return.loanId,
              astLoan: _return.astLoan,
              user: _return.user,
              accLoans: _return.accLoans
            })
          }
        })

        setFormData({
          returns: newReturns
        });
      } catch (err) {
        console.error(err);
        handleError(err)
      }
    };
    loadPresetValues()
  }, [initialValues, handleError]);

  const setValuesExcel = useCallback(async (records) => {
    // CANNOT SEARCH FOR ASSET HERE, MAYBE CAN TRY IN FUTURE TO GET THE UPDATED VALUE
    try {

      const serialNumbers = new Set();

      records.forEach(record => {
          // Trim and add asset tags to the set

        Object.keys(record).forEach(field => {
          record[field] = record[field]?.toString().trim();
        });

        ['serialNumber'].forEach(field => {
          if (!record[field]) throw new Error(`Missing ${field} at line ${record.__rowNum__}`);
        });
        
        if (serialNumbers.has(record.serialNumber)) throw new Error(`Duplicate records for serialNumber: ${record.serialNumber} were found`);
        else serialNumbers.add(record.serialNumber);
      });

      const assetResponse = await loanService.fetchAstReturn([...serialNumbers])
      console.log(assetResponse);

      const assetOptions = assetResponse.data; // gets all possible asset tags, some possibly missing
      const userOptions = assetOptions
        .filter(assetOption => assetOption.user)
        .map(assetOption => ({
          ...assetOption.user,
          value: assetOption.user.userName,
          label: assetOption.user.userName,
        })
      )

      const returns = records.map(({serialNumber, remarks}) => {
        const matchedAssetOption = assetOptions.find(option => compareStrings(option.label, serialNumber)); 
        // unlike other forms, dont need to check for isDisabled since this only fills the "search" input
        console.log(matchedAssetOption);

        return {
          loanId: matchedAssetOption?.loanId,
          astLoan: matchedAssetOption?.astLoan,
          user: matchedAssetOption?.user,
          accLoans: matchedAssetOption?.accLoans,
          remarks,
          search: serialNumber
        }
      })

      setReturnOptions(assetOptions);
      setUserOptions(userOptions); 
    
      console.log(userOptions);
    
      setFormData({
        returns: returns.map(_return => createNewReturn(_return))
      });
    } catch (error) {
      handleError(error);
    }
  }, [setFormData, handleError]); 

  const prevStep = () => {
    setStep(Math.min(step - 1, 1))
  };

  const nextStep = (values, actions) => {
    console.log('Manual Form Values:', values);

    const newUserReturns = {}

    values.returns.forEach((ret) => {
      // If serialNumber doesn't exist in newUserReturns, initialize it
      if (newUserReturns[ret.asset.serialNumber]) throw Error(`Duplicate Serial Number ${ret.serialNumber} found`)
    });
    setStep(Math.max(step + 1, 2));
    setFormData(values);
  };

  const handleSubmit = async (values, actions) => {
    setLoading(true);
    console.log('Manual Form Values:', values);
    try {
      await loanService.returnItems(values);
      actions.setSubmitting(false);
      setLoading(false);
      showToast('Assets successfully returned', 'success', 500);
      setFormType(null);
      reload();
    } catch (err) {
      console.error(err);
      handleError(err);
      console.error("Error Handled");
      setLoading(false);
    }
  };

  // The context value includes all the states and functions to be shared
  const value = {
    formData,
    userOptions,
    setUserOptions,
    returnOptions,
    setReturnOptions,
    step,
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
    <ReturnsContext.Provider value={value}>
      <Box hidden={step !== 1}>
        <ReturnStep1/>
      </Box>
      
      {step === 2 && <ReturnStep2 />}
    </ReturnsContext.Provider>
  );
};

// Hook to use the LoanContext in child components
export const useReturns = () => {
  return useContext(ReturnsContext);
};