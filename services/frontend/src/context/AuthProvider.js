import React, { createContext, useContext, useState, useEffect } from 'react';
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

  // Check authentication on mount and periodically
  useEffect(() => {
    const performAuthCheck = async () => {
      try {
        console.log("Checking auth...");
        const response = await authService.checkAuth();
        const validatedAdmin = response.data;
        console.log(validatedAdmin.pwd);
        if (isLoading && validatedAdmin) {
          console.log("Validated admin:", validatedAdmin);
          setAdmin(validatedAdmin);
          setIsLoading(false);
          if (validatedAdmin.pwd) navigate('/dashboard', {replace: true});
          navigate('/profile', {replace: true});
        }
        // if loading and not validatedAdmin, error thrown (no cookie, user must login)
        // if loaded and not validatedAdmin, error thrown (session timed out)
        // if loaded and validatedAdmin, nothing wrong
      } catch (error) {
        if (admin) {
          handleError("Your session has timed out, please login again");
          setAdmin(null);
        }
      } finally {
        setIsLoading(false); // Prevents premature logout
      }
    };

    performAuthCheck();
    const interval = setInterval(performAuthCheck, 300000);

    return () => clearInterval(interval);
  }, [navigate, admin, setAdmin, handleError, isLoading]);

  // Only logout when auth check is complete AND admin is null
  useEffect(() => {
    if (isLoading) return; // Don't log out before auth check finishes
    if (admin) return;

    const logout = async () => {
      try {
        console.log("No admin, logging out...");
        await authService.logout();
        navigate('/login', { replace: true });
      } catch (error) {
        handleError("Failed to log out:", error);
      }
    };

    logout();
  }, [navigate, handleError, admin, isLoading]);

  // Attach Axios interceptor to handle 401 responses globally
  useEffect(() => {
    const interceptorId = axiosInstance.interceptors.response.use(
      response => response,
      error => {
        if (error.response?.status === 401 && admin) {
          handleError("Your session has timed out, please login again");
          setAdmin(null);
        }
        return Promise.reject(error);
      }
    );

      return () => axiosInstance.interceptors.response.eject(interceptorId);
  }, [admin, handleError]);

  return (
    <AuthContext.Provider value={{ admin, setAdmin }}>
      <Outlet /> {/* Renders child components inside AuthProvider */}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
