import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { axiosInstance } from '../config';
import { useUI } from './UIProvider';
import authService from '../services/AuthService';

const AuthContext = createContext(null);

export const AuthProvider = () => {
  console.log("Rendering Auth Provider");

  const [admin, setAdmin] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Prevents logout before auth check completes
  const { handleError } = useUI();
  const navigate = useNavigate();

  const logout = useCallback(async () => {
    try {
      // console.log("No admin, logging out...");
      setAdmin(null);
      await authService.logout();
      navigate('/login', { replace: true });
    } catch (error) {
      handleError("Failed to log out:", error);
    }
  }, [handleError, navigate]);

  // Check authentication on mount and periodically
  useEffect(() => {
    const performAuthCheck = async () => {
      try {
        console.log("Checking auth...");
        const response = await authService.checkAuth();
        const validatedAdmin = response.data;
        if (isLoading && validatedAdmin?.adminName) {
          setAdmin(validatedAdmin);
          setIsLoading(false);
          if (!validatedAdmin.canSetupPassword) navigate('/dashboard', {replace: true});
          navigate('/profile', {replace: true});
        }
        // if loading and not validatedAdmin, error thrown (no cookie, user must login)
        // if loaded and not validatedAdmin, error thrown (session timed out)
        // if loaded and validatedAdmin, nothing wrong
      } catch (error) {
        if (admin) {
          handleError("Your session has timed out, please login again");
          logout();
        }
      } finally {
        setIsLoading(false); // Prevents premature logout
      }
    };

    performAuthCheck();
    const interval = setInterval(performAuthCheck, 300000);

    return () => clearInterval(interval);
  }, [navigate, admin, setAdmin, handleError, isLoading, logout]);

  // Attach Axios interceptor to handle 401 responses globally
  useEffect(() => {
    const interceptorId = axiosInstance.interceptors.response.use(
      response => response,
      error => {
        if (error.response?.status === 401 && admin) {
          handleError("Your session has timed out, please login again");
          logout();
        }
        return Promise.reject(error);
      }
    );

      return () => axiosInstance.interceptors.response.eject(interceptorId);
  }, [admin, handleError]);

  return (
    <AuthContext.Provider value={{ admin, setAdmin, logout }}>
      <Outlet /> {/* Renders child components inside AuthProvider */}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
