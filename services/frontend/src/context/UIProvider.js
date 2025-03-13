import { useToast } from '@chakra-ui/react';
import React, { createContext, useCallback, useContext, useState, Alert, AlertIcon, CloseButton } from 'react';
import { ResponsiveText } from '../components/utils/ResponsiveText';

const UIContext = createContext(false);

export const UIProvider = ({ children }) => {
  console.log("Rendering UI Provider");
  // TODO toaster

  const toast = useToast();

  const showToast = useCallback((description, status = 'error', duration = 5000) => {
    toast({
      title: status.charAt(0).toUpperCase() + status.slice(1),
      description: description,
      status: status,
      duration: duration,
      isClosable: true,
      position: "bottom"
    });
  }, [toast]);

  const handleError = useCallback((error) => {
    console.log(error);  
    let errorMessage = 'An unexpected error occurred. Please try again later.';

    if (typeof error === "string") errorMessage = error;

    if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
    } else if (error.response) {
      // Otherwise, use a fallback message based on the status code
      const status = error.response.status;
      switch (status) {
        case 400:
          errorMessage = 'There was a problem with your request. Please check your data and try again.';
          break;
        case 401:
          errorMessage = 'You are not authorized. Please login and try again.';
          break;
        case 403:
          errorMessage = 'Access denied. You do not have permission to perform this action.';
          break;
        case 404:
          errorMessage = 'The requested resource was not found.';
          break;
        case 500:
          errorMessage = 'An issue with the server has occurred. Please try again later.';
          break;
        default:
          errorMessage = `Received unexpected response from the server: ${status}`;
      }
    } else if (error.request) {
      // No response received (Network issues, server down, CORS error, etc.)
      errorMessage = 'No response was received from the server. Please check your network connection.';
    } else if (error.message) {
      // Generic Axios error message
      errorMessage = error.message;
    }

    showToast(errorMessage, 'error');
  }, [showToast])

  const handleDevError = useCallback(() => {
    showToast("This feature is under development", 'error');
  }, [showToast])

  const DismissableAlert = (text) => {
    const [show, setShow] = useState(true);
  
    return show ? (
      <Alert status="error">
        <AlertIcon />
        <ResponsiveText>{text}</ResponsiveText>
        <CloseButton position="absolute" right="8px" top="8px" onClick={() => setShow(false)} />
      </Alert>
    ) : null;
  };

  return (
    <UIContext.Provider value={{ DismissableAlert, showToast, handleError, handleDevError }}>
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