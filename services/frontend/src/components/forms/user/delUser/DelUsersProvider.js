import { createContext, useContext, useEffect, useState } from "react";
import { DelUserStep2 } from "./DelUserStep2";
import { DelUserStep1 } from "./DelUserStep1";
import { useUI } from "../../../../context/UIProvider";
import { Box } from "@chakra-ui/react";
import { useFormModal } from "../../../../context/ModalProvider";
import { compareStrings, convertExcelDate } from "../../utils/validation";
import userService from "../../../../services/UserService";
import { useLoading } from "../../../../context/LoadingProvider";
import { delNewUser } from "./helpers";

// Create a context
const DelUsersContext = createContext();

// Create a provider component
export const DelUsersProvider = () => {
  const { showToast, handleError } = useUI();
  const { setLoading } = useLoading();
  const { setFormType, initialValues, triggerRefresh, reinitializeForm } = useFormModal();
  const [ warnings, setWarnings ] = useState({});

  const [userOptions, setUserOptions] = useState([]);

  const [formData, setFormData] = useState({
    users: [delNewUser()],
  });
  const [step, setStep] = useState(1);

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

  const setValuesExcel = async (records) => {
    // CANNOT SEARCH FOR ASSET HERE, MAYBE CAN TRY IN FUTURE TO GET THE UPDATED VALUE
    try {
      const userNames = new Set();
      // const serialNumbers = new Set();

      records.forEach((record) => {

        Object.keys(record).forEach(field => {
          record[field] = field !== 'delDate'
            ? record[field]?.toString().trim()
            : record[field] ? convertExcelDate(record[field], record.__rowNum__) : new Date();
        });

        ['userName'].forEach(field => {
          if (!record[field]) throw new Error(`Missing ${field} at line ${record.__rowNum__}`);
        });
        
        if (userNames.has(record.userName)) throw new Error(`Duplicate records for userName: ${record.userName} were found`);
        else userNames.add(record.userName);
      });

      if (userNames.size === 0) throw new Error("No user names found!")

      const userResponse = await userService.fetchUserDel([...userNames]);
      const newUserOptions = userResponse.data;
      setUserOptions(newUserOptions);

      const users = records.map((record) => {
        const { userName, remarks, delDate } = record;
        const matchedUserOption = newUserOptions.find(option => compareStrings(option.value, userName));
        
        if (!matchedUserOption || matchedUserOption.isDisabled) {
          return {
            userName, // Pass userName regardless of whether id is found
            delDate,
            remarks,
        };
        } else {
          return {
              userId: matchedUserOption ? matchedUserOption.userId : null,
              lastEventDate: matchedUserOption ? matchedUserOption.lastEventDate : null,
              userName,
              delDate,
              remarks,
          };
        }
      })
    
      reinitializeForm({
        users: users.map(user => delNewUser(user))
      });

    } catch (error) {
      handleError(error);
    }
  };

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
    formData,
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
    <DelUsersContext.Provider value={value}>
      <Box style={{ display: step === 1 ? 'block' : 'none' }}>
        <DelUserStep1/>
      </Box>
      <Box style={{ display: step === 2 ? 'block' : 'none' }}>
        <DelUserStep2/>
      </Box>
    </DelUsersContext.Provider>
  )
};

// Hook to use the LoanContext in child components
export const useDelUsers = () => {
  return useContext(DelUsersContext);
};