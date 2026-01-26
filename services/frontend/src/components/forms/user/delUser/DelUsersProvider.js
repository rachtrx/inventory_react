import { createContext, useContext, useEffect, useState } from "react";
import { DelUserStep2 } from "./DelUserStep2";
import { DelUserStep1 } from "./DelUserStep1";
import { useUI } from "../../../../context/UIProvider";
import { Box } from "@chakra-ui/react";
import { useForm } from "../../../../context/FormProvider";
import { compareStrings, convertExcelDate } from "../../utils/validation";
import userService from "../../../../services/UserService";
import { useLoading } from "../../../../context/LoadingProvider";
import { delNewUser } from "./helpers";

// Create a context
const DelUsersContext = createContext();

// Create a provider component
export const DelUsersProvider = ({ children }) => {
  const { showToast, handleError } = useUI();
  const { setLoading } = useLoading();
  const { setFormType, initialValues, triggerRefresh, reinitializeForm } = useForm();

  const [userOptions, setUserOptions] = useState([]);

  useEffect(() => {
    if (!initialValues?.userIds?.length) return;

    const fetchUsrDeletes = async () => {
      try {

        const userResponse = await userService.fetchUserDelById(initialValues.userIds);
        setUserOptions(userResponse.data);
  
        const userObjs = initialValues.userIds.map(userId => {
          const matchedUserOption = userResponse.data.find(assetOption => assetOption.userId === userId);
          console.log(matchedUserOption);
          if (!matchedUserOption) throw new Error(`User not found`)
          else if (matchedUserOption.isDisabled) throw new Error(`User cannot be removed`)
          else return matchedUserOption;
        })
        const users = userObjs.map(user => {
          return delNewUser(user);
        })
        reinitializeForm({users});
      } catch (err) {
        handleError(err);
      }
    }
    fetchUsrDeletes()
  }, [initialValues, reinitializeForm, handleError]);

  const handleSubmit = async (values, actions) => {
    setLoading(true);
    console.log('Manual Form Values:', values);
    try {
      await userService.delUser(values);
      actions.setSubmitting(false);
      setLoading(false);
      showToast('Users successfully deleted', 'success', 500);
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
    userOptions,
    setUserOptions,
    handleSubmit,
  };

  return (
    <DelUsersContext.Provider value={value}>
      {children}
    </DelUsersContext.Provider>
  )
};

// Hook to use the LoanContext in child components
export const useDelUsers = () => {
  return useContext(DelUsersContext);
};