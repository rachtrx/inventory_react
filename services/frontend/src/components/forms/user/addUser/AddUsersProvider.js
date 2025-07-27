import { createContext, useContext, useEffect, useState } from "react";
import { useUI } from "../../../../context/UIProvider";
import { useForm } from "../../../../context/FormProvider";
import userService from "../../../../services/UserService";
import { useLoading } from "../../../../context/LoadingProvider";

// Create a context
const AddUsersContext = createContext();

// Create a provider component
export const AddUsersProvider = ({ children }) => {
  const { showToast, handleError } = useUI();
  const { setLoading } = useLoading();
  const { setFormType, triggerRefresh } = useForm();
  const [deptOptions, setDeptOptions] = useState([]);

  useEffect(() => {
    console.log(deptOptions);
  }, [deptOptions])

  useEffect(() => {
    const fetchFilters = async () => {
        const deptFilters = await getDeptFilters();
        setDeptOptions(deptFilters);
    };

    fetchFilters();
  }, []);

  const getDeptFilters = async () => {
      const response = await userService.getFilters('deptName');
      const options = response.data;
      return options.map(option => ({
          deptId: option.value,
          value: option.label,
          label: option.label
      }));
  };

  const addNewDept = async (deptName) => {
    try {
      setLoading(true);
      const response = await userService.createNewDept(deptName);
      setDeptOptions(oldArray => [
        ...oldArray.filter(item => !(item.value === deptName && !item.deptId)),
        { 
          deptId: response.data.data.id, 
          value: response.data.data.deptName, 
          label: response.data.data.deptName 
        }
      ]);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      handleError(error);
    }
  }

  const handleSubmit = async (values, actions) => {
    setLoading(true);
    console.log('Manual Form Values:', values);
    try {
      await userService.addUser(values);
      actions.setSubmitting(false);
      setLoading(false);
      showToast('Users successfully added', 'success', 500);
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
    deptOptions,
    addNewDept,
    handleSubmit
  };

  return (
    <AddUsersContext.Provider value={value}>
      {children}
    </AddUsersContext.Provider>
  )
};

// Hook to use the LoanContext in child components
export const useAddUsers = () => {
  return useContext(AddUsersContext);
};