import React, { createContext, useContext, useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { axiosInstance } from '../config';
import { useUI } from './UIProvider';

import { PublicClientApplication } from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';
import { msalConfig } from '../authConfig';
const msalInstance = new PublicClientApplication(msalConfig);

const AuthContext = createContext(null);

export const AuthProvider = () => {

  console.log("Rendering Auth Provider");

  const [admin, setAdmin] = useState(null);
  const { handleError } = useUI()

  useEffect(() => {
    const interceptorId = axiosInstance.interceptors.response.use(
      response => response,
      error => {
        if (error.config.headers['Skip-Interceptor']) {
          console.log("From interceptor");
          return Promise.reject(error); // Bypass interceptor processing
        }

        console.log(`User in authprovider axios: ${admin}`);
        if (error.response && error.response.status === 401 && admin) {
          handleError("Your session has timed out, please login again");
          setAdmin(null);
        }

        return Promise.reject(error);
      }
    );

    return () => {
      axiosInstance.interceptors.response.eject(interceptorId);
    };
  }, [admin, handleError]);
  
  return (
    <MsalProvider instance={msalInstance}>
      <AuthContext.Provider value={{ admin, setAdmin }}>
        <Outlet />
      </AuthContext.Provider>
    </MsalProvider>
  );
};



export const useAuth = () => useContext(AuthContext);