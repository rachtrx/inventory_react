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
    let errorMessage = 'An unexpected error occurred. Please try again later.';

    if (error.response) {
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
          errorMessage = 'An issue with the server has occured. Please try again later.';
          break;
        default:
          errorMessage = `Received unexpected response from the server: ${status}`;
      }
    } else if (error.request) {
      errorMessage = 'No response was received from the server. Please check your network connection.';
    } else if (error.message) {
      errorMessage = error.message;
    } else {
      errorMessage = error
    }

    setError(errorMessage); // Assuming setError updates your component's state
    showToast(errorMessage, 'error'); // Show toast notification with the error message
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