import { Box, Flex } from "@chakra-ui/react";
import ExcelFormControl from '../utils/ExcelFormControl';
import InputFormControl from '../utils/InputFormControl';
import SelectFormControl from "../utils/SelectFormControl";
import DateInputControl from "../utils/DateInputControl";
import FormToggle from "../utils/FormToggle";
import { useFormModal } from "../../../context/ModalProvider";
import { useItems } from "../../../context/ItemsProvider";
import { SingleSelectFormControl } from "../utils/SelectFormControl";
import { useEffect, useMemo, useState } from "react";
import ReturnStep1 from "./ReturnStep1";
import { ReturnStep2 } from "./ReturnStep2";
import { useUI } from "../../../context/UIProvider";
import { createNewReturn } from "./Return";

const Returns = () => {

  const { setLoading, showToast, handleError } = useUI();
  const { setFormType, initialValues } = useFormModal();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    returns: [createNewReturn()],
  });
  const [userLoans, setUserLoans] = useState({});

  useEffect(() => {
    if (initialValues) {
      const assetTag = initialValues.assetTag
      const userNames = [initialValues.userName || '']
      setFormData({
        loans: [createNewReturn(assetTag, users)],
        signatures: {}
      })
    }
  }, [initialValues])

  const prevStep = () => {
    const resetLoans = formData.loans.map(loan => {
      return createNewLoan(
        loan.asset.assetTag, 
        loan.users.map(user => user.userName), 
        loan.asset.peripherals,
        loan.loanDate,
        loan.expectedReturnDate
      );
    })
    setFormData((prevData) => ({
      ...prevData,
      loans: resetLoans
    }));
    setStep(step - 1)
  };

  const fetchReturn = async (values) => {
    console.log('Fetching return for:', values);

    const userLoans = {}
    const signatures = {};

    values.loans.forEach((loan) =>
      loan.users?.forEach((user) => {
        if (!userLoans[user.userId]) {
          userLoans[user.userId] = {}
          userLoans[user.userId].assets = [loan.asset];
          userLoans[user.userId].userName = user.userName;
          signatures[user.userId] = ''
          console.log(signatures);
        } else userLoans[user.userId].assets.push(loan.asset)
      })
    );
    setUserLoans(userLoans);
    setFormData((prevData) => ({
      ...prevData,
      ...values,
      signatures: signatures,
    }));
  };

  const handleUserData = (values, actions) => {
    console.log('Manual Form Values:', values);
    const userLoans = {}
    const signatures = {};

    values.loans.forEach((loan) =>
      loan.users?.forEach((user) => {
        if (!userLoans[user.userId]) {
          userLoans[user.userId] = {}
          userLoans[user.userId].assets = [loan.asset];
          userLoans[user.userId].userName = user.userName;
          signatures[user.userId] = ''
          console.log(signatures);
        } else userLoans[user.userId].assets.push(loan.asset)
      })
    );
    setUserLoans(userLoans);
    setFormData((prevData) => ({
      ...prevData,
      ...values,
      signatures: signatures,
    }));
    setStep(step + 1);
  };

  const handleSubmit = async (values, actions) => {
    setLoading(true);
    console.log('Manual Form Values:', values);
    try {
      await assetService.loanAsset(values);
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

  return (
    <Box>
      {step === 1 && <ReturnStep1 nextStep={handleUserData} formData={formData} setFormData={setFormData}/>}
      {step === 2 && <ReturnStep2 prevStep={prevStep} handleSubmit={handleSubmit} userLoans={userLoans} formData={formData}/>}
    </Box>
  );
};

export default Returns;