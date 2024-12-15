import React, { createContext, useContext, useEffect, useState } from "react";
import { AddUserStep2 } from "./AddUserStep2";
import { AddUserStep1 } from "./AddUserStep1";
import { useUI } from "../../../context/UIProvider";
import assetService from "../../../services/AssetService";
import { Box } from "@chakra-ui/react";
import { useFormModal } from "../../../context/ModalProvider";
import { v4 as uuidv4 } from 'uuid';
import userService from "../../../services/UserService";
import { compareStrings, convertExcelDate } from "../utils/validation";

export const createNewDept = (dept={}) => ({
  'key': uuidv4(),
  'deptId': dept.deptId || '',
  'deptName': dept.deptName || '',
  'users': (dept.users || [{}]).map(user => createNewUser(user))
})

export const createNewUser = (user={}) => ({
  'key': uuidv4(),
  'userName': user.userName || '',
  'remarks': user.remarks || '',
  'addDate': user.addDate || new Date(),
})

// Create a context
const AddUsersContext = createContext();

// Create a provider component
export const AddUsersProvider = ({ children }) => {
  const { setLoading, showToast, handleError } = useUI();
  const { setFormType } = useFormModal();
  const [ warnings, setWarnings ] = useState({});

  const [deptOptions, setDeptOptions] = useState([]);

  const [formData, setFormData] = useState({
    depts: [createNewDept()],
  });
  const [step, setStep] = useState(1);

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

  const setValuesExcel = async (records) => {
    // CANNOT SEARCH FOR ASSET HERE, MAYBE CAN TRY IN FUTURE TO GET THE UPDATED VALUE
    try {
      const userNames = new Set();

      const recordsMap = {};

      records.forEach((record) => {

        console.log(record);

        Object.keys(record).forEach(field => {
          record[field] = field !== 'addDate'
            ? record[field].toString().trim()
            : convertExcelDate(record[field], record.__rowNum__);
        });
        
        ['deptName', 'userName'].forEach(field => {
          if (!record[field]) throw new Error(`Missing ${field} at line ${record.__rowNum__}`);
        });
        
        const { deptName, userName, addDate, remarks } = record;

        if (userNames.has(userName)) throw new Error(`Duplicate usernames found: ${userName}`);
        else userNames.add(userName);

        if (!recordsMap[deptName]) {
          recordsMap[deptName] = [];
        }
        
        recordsMap[deptName].push({
          userName,
          addDate,
          remarks
        });
      });

      const depts = [];

      Object.entries(recordsMap).forEach(([deptName, users]) => {
        const dept = deptOptions.find(option => compareStrings(option.value, deptName)) || '';

        depts.push(createNewDept({
          deptId: dept?.deptId || '',
          deptName: dept?.deptName || deptName,
          users: users,
        }))
      })
    
      setFormData({
        depts: depts
      });

    } catch (error) {
      handleError(error);
    }
  };

  const prevStep = () => {
    setStep(step - 1)
  };

  const nextStep = () => {
    setStep(step + 1);
  };

  const handleSubmit = async (values, actions) => {
    setLoading(true);
    console.log('Manual Form Values:', values);
    try {
      // await assetService.loanAsset(values);
      actions.setSubmitting(false);
      setLoading(false);
      showToast('Assets successfully loaned', 'success', 500);
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
    deptOptions,
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
    <AddUsersContext.Provider value={value}>
      <Box style={{ display: step === 1 ? 'block' : 'none' }}>
        <AddUserStep1/>
      </Box>
      <Box style={{ display: step === 2 ? 'block' : 'none' }}>
        <AddUserStep2/>
      </Box>
    </AddUsersContext.Provider>
  )
};

// Hook to use the LoanContext in child components
export const useAddUsers = () => {
  return useContext(AddUsersContext);
};