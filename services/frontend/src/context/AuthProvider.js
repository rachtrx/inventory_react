import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config';

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true
});

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const logout = useCallback(async () => {
    console.log("Logging out!");
    try {
        await axiosInstance.post('/auth/logout'); // Call to backend to clear the cookie
        setUser(null);
        navigate('/login', { replace: true });
    } catch (error) {
        console.error("Failed to log out:", error);
    }
  }, [navigate]);

  useEffect(() => {
    const interceptorId = axiosInstance.interceptors.response.use(
      response => response,
      error => {
        console.log(`User in authprovider axios: ${user}`);
        if (user && error.response && error.response.status === 401) {
          logout();
        }
        return Promise.reject(error);
      }
    );
  
    return () => {
      axiosInstance.interceptors.response.eject(interceptorId);
    };
  }, [user, logout]);

  const login = async (email, password) => {
    try {
      const response = await axiosInstance.post('/auth/login', { email, password });
      const { userName } = response.data;
      console.log(userName);
      setUser(userName);
    } catch (error) {
      throw error;
    }
  };

  const register = async (adminName, email, password) => {
    try {
      await axiosInstance.post('/auth/register', { adminName, email, password });
    } catch (error) {
      console.error('Login failed:', error.response ? error.response.data : error);
      throw error
    }
  };

  const checkAuth = async () => {
    try {
      const response = await axiosInstance.get('auth/checkAuth');
      return response.data; // Changed from response.body to response.data
    } catch (error) {
      console.error("Not authorized:", error);
      return { isAuthenticated: false, userName: null }; // Ensure a fallback structure
    }
  };
  

  return (
    <AuthContext.Provider value={{ user, setUser, register, login, logout, checkAuth, axios: axiosInstance }}>
      <Outlet />
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);