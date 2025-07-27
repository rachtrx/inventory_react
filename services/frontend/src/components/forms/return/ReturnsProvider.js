import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useUI } from "../../../context/UIProvider";
import { Box } from "@chakra-ui/react";
import { useForm } from "../../../context/FormProvider";
import ReturnStep1 from "./ReturnStep1";
import { ReturnStep2 } from "./ReturnStep2";
import { compareStrings } from "../utils/validation";
import { useLoading } from "../../../context/LoadingProvider";
import loanService from "../../../services/LoanService";
import { createNewReturn } from "./helpers";

// Create a context
const ReturnsContext = createContext();

// Create a provider component
export const ReturnsProvider = ({ children }) => {
  const { showToast, handleError } = useUI();
  const { setLoading } = useLoading();
  const { setFormType, initialValues, triggerRefresh, reinitializeForm } = useForm();
  const [ returnOptions, setReturnOptions ] = useState([]);
  const [ userOptions, setUserOptions ] = useState([]);

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

        reinitializeForm({
          returns: newReturns
        });
      } catch (err) {
        console.error(err);
        handleError(err)
      }
    };
    loadPresetValues()
  }, [initialValues, handleError, reinitializeForm]);

  const handleSubmit = async (values, actions) => {
    setLoading(true);
    console.log('Manual Form Values:', values);
    try {
      await loanService.returnItems(values);
      actions.setSubmitting(false);
      setLoading(false);
      showToast('Assets successfully returned', 'success', 500);
      setFormType(null);
      triggerRefresh();
    } catch (err) {
      console.error(err);
      handleError(err);
      console.error("Error Handled");
      setLoading(false);
    }
  };

  // The context value includes all the states and functions to be shared
  const value = {
    userOptions,
    setUserOptions,
    returnOptions,
    setReturnOptions,
    handleSubmit
  };

  return (
    <ReturnsContext.Provider value={value}>
      {children}
    </ReturnsContext.Provider>
  );
};

// Hook to use the LoanContext in child components
export const useReturns = () => {
  return useContext(ReturnsContext);
};