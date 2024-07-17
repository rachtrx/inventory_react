import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { axiosInstance } from '../config';
import { ModalProvider } from './ModalProvider';
import { DrawerProvider } from './DrawerProvider';

const AuthContext = createContext(null);

export const AuthProvider = () => {

  console.log("Rendering Auth Provider");

  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation()

  const logout = useCallback(async () => {
    console.log("Logging out!");
    if (location.pathname === '/login') return;

    try {
        await axiosInstance.post('/auth/logout'); // Call to backend to clear the cookie
        setUser(null);
        navigate('/login', { replace: true });
    } catch (error) {
        console.error("Failed to log out:", error);
    }
  }, [navigate, location]);

  const login = useCallback(async (email, password) => {
    try {
      const response = await axiosInstance.post('/auth/login', { email, password });
      const { userName } = response.data;
      console.log(userName);
      setUser(userName);
    } catch (error) {
      throw error;
    }
  }, []);

  const register = useCallback(async (adminName, email, password) => {
    try {
      await axiosInstance.post('/auth/register', { adminName, email, password });
    } catch (error) {
      console.error('Registration failed:', error.response ? error.response.data : error);
      throw error;
    }
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      const response = await axiosInstance.get('auth/checkAuth');
      console.log(response);
      const { userName } = response.data;
      setUser(userName);
    } catch (error) {
      console.error("Not authorized:", error);
      logout();
    }
  }, [logout]); // Add dependencies as needed

  useEffect(() => {
    const interceptorId = axiosInstance.interceptors.response.use(
      response => response,
      error => {
        console.log(`User in authprovider axios: ${user}`);
        if (!user) logout();
        return Promise.reject(error);
      }
    );
  
    return () => {
      axiosInstance.interceptors.response.eject(interceptorId);
    };
  }, [user, logout]);
  
  return (
    <AuthContext.Provider value={{ user, setUser, register, login, logout, checkAuth }}>
      <DrawerProvider>
        <ModalProvider>
          <Outlet />
        </ModalProvider>
      </DrawerProvider>
    </AuthContext.Provider>
  );
};



export const useAuth = () => useContext(AuthContext);