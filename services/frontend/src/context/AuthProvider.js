import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { axiosInstance } from '../config';
import { useUI } from './UIProvider';

const AuthContext = createContext(null);

export const AuthProvider = () => {

  console.log("Rendering Auth Provider");

  const [user, setUser] = useState(null);
  const { handleError } = useUI()

  useEffect(() => {
    const interceptorId = axiosInstance.interceptors.response.use(
      response => response,
      error => {
        if (error.config.headers['Skip-Interceptor']) {
          console.log("From interceptor");
          return Promise.reject(error); // Bypass interceptor processing
        }

        console.log(`User in authprovider axios: ${user}`);
        if (error.response && error.response.status === 401 && user) {
          handleError("Your session has timed out, please login again");
          setUser(null);
        }

        return Promise.reject(error);
      }
    );

    return () => {
      axiosInstance.interceptors.response.eject(interceptorId);
    };
  }, [user, handleError]);
  
  return (
    <AuthContext.Provider value={{ user, setUser }}>
      <Outlet />
    </AuthContext.Provider>
  );
};



export const useAuth = () => useContext(AuthContext);