import React, { useEffect, useState } from "react";
import { LoanStep2 } from "./LoanStep2";
import { LoanStep1 } from "./LoanStep1";
import { useUI } from "../../context/UIProvider";
import assetService from "../../services/AssetService";
import { createNewLoan } from "./Loan";
import { Box } from "@chakra-ui/react";
import { useFormModal } from "../../context/ModalProvider";

const Loans = () => {

  const { setLoading, showToast, handleError } = useUI();
  const { setFormType, initialValues } = useFormModal();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    loans: [createNewLoan()],
    signatures: {}
  });
  const [userLoans, setUserLoans] = useState({});

  useEffect(() => {
    if (initialValues) {
      const assetTag = initialValues.assetTag
      const userNames = [initialValues.userName || '']
      setFormData({
        loans: [createNewLoan(assetTag, userNames)],
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
      {step === 1 && <LoanStep1 nextStep={handleUserData} formData={formData} setFormData={setFormData}/>}
      {step === 2 && <LoanStep2 prevStep={prevStep} handleSubmit={handleSubmit} userLoans={userLoans} formData={formData}/>}
    </Box>
  );
};

export default Loans;