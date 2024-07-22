import { useToast } from '@chakra-ui/react';
import React, { createContext, useContext, useState } from 'react';

const UIContext = createContext(false);

export const UIProvider = ({ children }) => {
  console.log("Rendering UI Provider");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // TODO toaster

  const toast = useToast();

  const showToast = (description, status = 'error', duration=5000) => {
    toast({
      title: status.charAt(0).toUpperCase() + status.slice(1),
      description: description,
      status: status,
      duration: duration,
      isClosable: true,
      position: "bottom"
    });
  };

  const handleError = (error) => {
    setError(error);
    showToast(error, 'error');
  };

  return (
    <UIContext.Provider value={{ loading, setLoading, error, setError, showToast, handleError }}>
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};