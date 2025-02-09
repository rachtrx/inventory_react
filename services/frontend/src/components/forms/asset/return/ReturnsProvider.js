import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useUI } from "../../../../context/UIProvider";
import assetService from "../../../../services/AssetService";
import { Box } from "@chakra-ui/react";
import { useFormModal } from "../../../../context/ModalProvider";
import { createNewAccessory, createNewReturn } from "./ReturnSearch";
import ReturnStep1 from "./ReturnStep1";
import { ReturnStep2 } from "./ReturnStep2";
import { compareStrings, convertExcelDate } from "../../utils/validation";

// Create a context
const ReturnsContext = createContext();

// Create a provider component
export const ReturnsProvider = ({ children }) => {
  const { setLoading, showToast, handleError } = useUI();
  const { setFormType, initialValues } = useFormModal();
  const [ warnings, setWarnings ] = useState({});
  const [ returnOptions, setReturnOptions ] = useState([]);
  const [ userOptions, setUserOptions ] = useState([]) 

  const [formData, setFormData] = useState({
    returns: [createNewReturn()],
  });
  const [step, setStep] = useState(1);

  useEffect(() => console.log(formData), [formData])

  useEffect(() => {
    if (!initialValues || Object.entries(initialValues).length === 0) return;
      const loadPresetValues = async () => {
        try {
          console.log(initialValues);
          const {assetId, serialNumber} = initialValues;
          if (!serialNumber) return;
          
          const response = await assetService.fetchAstReturn(serialNumber);
          console.log(response.data);
          const loan = response.data[0];
          const user = loan.user;

          setFormData({
            returns: [createNewReturn(
              loan.loanId,
              {assetId, serialNumber},
              user,
              loan.accLoans
            )]
          });
        } catch (err) {
          console.error(err);
          handleError('Error Loading Details')
        }
      };
      loadPresetValues();
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

      const assetResponse = await assetService.fetchAstReturn([...serialNumbers])
      console.log(assetResponse);

      const loanOptions = assetResponse.data; // gets all possible asset tags, some possibly missing

      const returns = records.map(({serialNumber, remarks}) => {
        const matchedLoanOption = loanOptions.find(option => compareStrings(option.label, serialNumber));

        if (!matchedLoanOption) {
          loanOptions.append(
            {
              loanId: null,
              search: serialNumber,
              value: serialNumber,
              label: serialNumber,
              remarks,
            }
          )
          // throw new Error(`Serial number ${serialNumber} not found!`);
        }

        // IMPT handled in errors
        // if (matchedLoanOption.isDisabled) {
        //   throw new Error(`No ongoing loan found for serial number ${serialNumber}!`);
        // }

        setReturnOptions(loanOptions)

        console.log(matchedLoanOption);

        setUserOptions((prevOptions) => [
          ...prevOptions, // Include previous user options
          {
            ...matchedLoanOption.user,
            value: matchedLoanOption.user.userName,
            label: matchedLoanOption.user.userName,
          },
        ]);        

        return createNewReturn(
          matchedLoanOption.loanId,
          matchedLoanOption.astLoan.asset,
          matchedLoanOption.user,
          matchedLoanOption.accLoans,
          remarks,
          serialNumber
        )
      })
    
      console.log(returns);
    
      setFormData({
        returns: returns
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
      await assetService.returnAsset(values);
      actions.setSubmitting(false);
      setLoading(false);
      showToast('Assets successfully returned', 'success', 500);
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
      <Box style={{ display: step === 1 ? 'block' : 'none' }}>
        <ReturnStep1/>
      </Box>
      <Box style={{ display: step === 2 ? 'block' : 'none' }}>
        <ReturnStep2/>
      </Box>
    </ReturnsContext.Provider>
  );
};

// Hook to use the LoanContext in child components
export const useReturns = () => {
  return useContext(ReturnsContext);
};