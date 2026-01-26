import React, { createContext, useContext, useState } from 'react';

const EditModeContext = createContext();

export const EditModeProvider = ({ children }) => {
  const [editable, setEditable] = useState(false); // default: not editable

  return (
    <EditModeContext.Provider value={{ editable, setEditable }}>
      {children}
    </EditModeContext.Provider>
  );
};

export const useEditMode = () => useContext(EditModeContext);
