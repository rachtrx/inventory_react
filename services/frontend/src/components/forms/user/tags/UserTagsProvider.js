import { createContext, useContext, useEffect, useState } from "react";

import { useUI } from "../../../../context/UIProvider";
import { useForm } from "../../../../context/FormProvider";

import { AddUserTagsStep2 } from "./addTag/AddUserTagsStep2";
import { AddUserTagsStep1 } from "./addTag/AddUserTagsStep1";
import { DelUserTagsStep1 } from "./delTag/DelUserTagsStep1";
import { DelUserTagsStep2 } from "./delTag/DelUserTagsStep2";
import userService from "../../../../services/UserService";
import { useLoading } from "../../../../context/LoadingProvider";

// Create a context
const UserTagsContext = createContext();

// Create a provider component
export const UserTagsFormProvider = ({ children }) => {
  const { showToast, handleError } = useUI();
  const { setLoading } = useLoading();
  const { setFormType, triggerRefresh } = useForm();

  const [ tagOptions, setTagOptions ] = useState([]);
  const [ userOptions, setUserOptions ] = useState({});

  // useEffect(() => {
  //   console.log(tagOptions);
  // }, [tagOptions])

  useEffect(() => { 
    const fetchFilters = async () => {
      const tagFilters = await getTagFilters();
      setTagOptions(tagFilters);
    };
    fetchFilters();
  }, []);

  const getTagFilters = async () => {
      const response = await userService.getFilters('userTag');
      const options = response.data;
      return options.map(option => ({
          value: option.label,
          label: option.label,
          tagId: option.id,
          tagName: option.label
      }));
  };

  const addNewTag = async (tagName) => {
    try {
      setLoading(true);
      const response = await userService.createNewTag(tagName);
      setTagOptions(oldArray => [
        ...oldArray.filter(item => !(item.value === tagName && !item.tagId)),
        { 
          tagId: response.data.data.id, 
          value: response.data.data.tagName, 
          label: response.data.data.tagName 
        }
      ]);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      handleError(error);
    }
  }

  const handleAddTagsSubmit = async (values, actions) => {
    setLoading(true);
    console.log('Manual Form Values:', values);
    try {
      await userService.tagUser(values);
      actions.setSubmitting(false);
      setLoading(false);
      showToast('Users successfully tagged', 'success', 500);
      setFormType(null);
      triggerRefresh();;
    } catch (err) {
      console.error(err);
      handleError(err);
      console.error("Error Handled");
      setLoading(false);
    }
  };
  
  const handleDelTagsSubmit = async (values, actions) => {
    setLoading(true);
    console.log('Manual Form Values:', values);
    try {
      await userService.untagUser(values);
      actions.setSubmitting(false);
      setLoading(false);
      showToast('Users successfully untagged', 'success', 500);
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
    tagOptions,
    addNewTag,
    userOptions, 
    setUserOptions,
    handleAddTagsSubmit,
    handleDelTagsSubmit,
  };

  return (
    <UserTagsContext.Provider value={value}>
      {children}
    </UserTagsContext.Provider>
  )
};

// Hook to use the LoanContext in child components
export const useUserTags = () => {
  return useContext(UserTagsContext);
};
