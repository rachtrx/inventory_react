import React, { createContext, useContext, useState } from 'react';
import { Box } from '@chakra-ui/react';

const StepContext = createContext();

export const StepProvider = ({ children }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});

  const prevStep = () => setStep((s) => Math.max(s - 1, 1));
  const nextStep = (values = {}) => {
    setFormData((prev) => ({ ...prev, ...values }));
    setStep((s) => Math.min(s + 1, 2));
  };

  const [step1, step2] = React.Children.toArray(children);

  return (
    <StepContext.Provider value={{ step, prevStep, nextStep, formData, setFormData }}>
      <Box display={step === 1 ? 'block' : 'none'}>
        {step1}
      </Box>
      <Box display={step === 2 ? 'block' : 'none'}>
        {step2}
      </Box>
    </StepContext.Provider>
  );
};

export const useStep = () => useContext(StepContext);
