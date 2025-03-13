import React, { createContext, useContext, useEffect, useState } from "react";

import { useUI } from "../../../../context/UIProvider";
import assetService from "../../../../services/AssetService";
import { Box } from "@chakra-ui/react";
import { useFormModal } from "../../../../context/ModalProvider";
import { v4 as uuidv4 } from 'uuid';
import { compareStrings, convertExcelDate } from "../../utils/validation";

import { AddUserTagsStep2 } from "./addTag/AddUserTagsStep2";
import { AddUserTagsStep1 } from "./addTag/AddUserTagsStep1";
import { DelUserTagsStep1 } from "./delTag/DelUserTagsStep1";
import { DelUserTagsStep2 } from "./delTag/DelUserTagsStep2";
import userService from "../../../../services/UserService";
import { useLoading } from "../../../../context/LoadingProvider";

export const createNewTag = (tag=null, users=[]) => ({
	'key': uuidv4(),
	'tagId': tag?.tagId || '',
	'tagName': tag?.tagName || '',
	'users': users.length !== 0 ? users.map(user => createNewUser(user)) : []
})

export const createNewUser = (user={}) => ({
	'key': uuidv4(),
	'userName': user.userName || '',
	'userId': user.userId || '',
  'remarks': user.remarks || '',
	'userTagId': user.tags?.find(tag => tag.isMatching)?.userTagId || '',
})

// Create a context
const UserTagsContext = createContext();

// Create a provider component
export const UserTagsFormProvider = ({
	fetchUsrForTagsFunc,
	Step1,
	Step2
}) => {
  const { showToast, handleError } = useUI();
  const { setLoading } = useLoading();
  const { setFormType } = useFormModal();
  const [ warnings, setWarnings ] = useState({});

  const [ tagOptions, setTagOptions ] = useState([]);
  const [ userOptions, setUserOptions ] = useState({});

  const [formData, setFormData] = useState({
    tags: [createNewTag()],
  });
  const [step, setStep] = useState(1);

  useEffect(() => {
    console.log(tagOptions);
  }, [tagOptions])

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

  const setValuesExcel = async (records) => {
    // CANNOT SEARCH FOR ASSET HERE, MAYBE CAN TRY IN FUTURE TO GET THE UPDATED VALUE
    try {
      const recordsMap = {};
      const unDict = {}; // username dictionary for <tag: usernames>

      records.forEach((record) => {
        ['tag', 'userName'].forEach(field => {
          if (!record[field]) throw new Error(`Missing ${field} at line ${record.__rowNum__}`);
        });

        const { tag, userName, remarks="" } = record;

        if (!unDict[tag]) {
          unDict[tag] = new Set();
        }

        if (unDict[tag].has(userName)) throw new Error(`Duplicate records for UserName: ${userName} were found`);
        else unDict[tag].add(userName);

        if (!recordsMap[tag]) {
          recordsMap[tag] = [];
        }
        
        recordsMap[tag].push({userName, remarks});
      });
      const tags = [];

      for (const [ tagName, userRows ] of Object.entries(recordsMap)) {
        const userNames = unDict[tagName]

        let tagOption = tagOptions.find(option => compareStrings(option.value, tagName));
        let newUserOptions;
        let response;

        if (!tagOption) {
          tagOption = { tagName }
          response = await fetchUsrForTagsFunc([...userNames])
        } else {
          response = await fetchUsrForTagsFunc([...userNames], tagOption.tagId) 
        }
        newUserOptions = response.data;
        setUserOptions({ ...userOptions, [tagName]: newUserOptions });
        console.log(newUserOptions);

        const userObjs = userRows.map(({userName, remarks}) => {
          const matchedUserOption = newUserOptions.find(option => compareStrings(option.value, userName));
          console.log(matchedUserOption);
          if (matchedUserOption) return { ...matchedUserOption, remarks};
          return {userName, remarks};
        })

        tags.push(createNewTag(tagOption, userObjs));
      }

      console.log(tags);
    
      setFormData({
        tags: tags
      });

    } catch (error) {
      handleError(error);
    }
  };

  const addNewTag = async (tagName) => {
    try {
      setLoading(true);
      const response = await userService.createNewTag(tagName);
      setTagOptions(oldArray => [
        ...oldArray.filter(item => !(item.value === tagName && !item.tagId)),
        { 
          tagId: response.data.newTag.id, 
          value: response.data.newTag.tagName, 
          label: response.data.newTag.tagName 
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
    console.log(values);
    setStep(step + 1);

    setFormData((prevData) => ({
      ...prevData,
      ...values
    }));
  };

  const handleAddTagsSubmit = async (values, actions) => {
    setLoading(true);
    console.log('Manual Form Values:', values);
    try {
      await userService.tagUser(values);
      actions.setSubmitting(false);
      setLoading(false);
      showToast('Users successfully tagged', 'success', 500);
      setFormType(null);
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
    formData,
    userOptions, 
    setUserOptions,
    step,
    setFormData,
    setStep,
    setValuesExcel,
    prevStep,
    nextStep,
    handleAddTagsSubmit,
    handleDelTagsSubmit,
    warnings,
    setWarnings
  };

  return (
    <UserTagsContext.Provider value={value}>
      <Box style={{ display: step === 1 ? 'block' : 'none' }}>
        <Step1/>
      </Box>
      <Box style={{ display: step === 2 ? 'block' : 'none' }}>
        <Step2/>
      </Box>
    </UserTagsContext.Provider>
  )
};

// Hook to use the LoanContext in child components
export const useUserTags = () => {
  return useContext(UserTagsContext);
};

export const AddUserTagsProvider = ({ children }) => (
  <UserTagsFormProvider
    fetchUsrForTagsFunc={userService.fetchTagUser}
		Step1={AddUserTagsStep1}
		Step2={AddUserTagsStep2}
  >
    {children}
  </UserTagsFormProvider>
);

export const DelUserTagsProvider = ({ children }) => (
  <UserTagsFormProvider
    fetchUsrForTagsFunc={userService.fetchUntagUser}
		Step1={DelUserTagsStep1}
		Step2={DelUserTagsStep2}
  >
    {children}
  </UserTagsFormProvider>
);