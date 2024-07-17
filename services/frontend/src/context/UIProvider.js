import React, { createContext, useContext, useState } from 'react';

const UIContext = createContext(false);

export const UIProvider = ({ children }) => {
  console.log("Rendering UI Provider");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // TODO toaster

  return (
    <UIContext.Provider value={{ loading, setLoading, error, setError }}>
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