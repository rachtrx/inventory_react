import React, { createContext, useContext, useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { api, eventBus } from '../config';
import authService from '../services/AuthService';
import { Footer } from '../components/Footer';
import { Box, Flex } from '@chakra-ui/react';

const AuthContext = createContext(null);

export const AuthProvider = () => {
  console.log("Rendering Auth Provider");
  const navigate = useNavigate();
  const location = useLocation();

  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    const handleLogout = () => {
      console.log('[AuthProvider] Handling logout (passive or manual)');
      setAdmin(null);
      if (window.location.pathname !== '/login') navigate('/login', { replace: true });
    };

    eventBus.on('logout', handleLogout);

    return () => {
      eventBus.off('logout', handleLogout);
    };
  }, [navigate]);

  useEffect(() => {
    const handleLogout = () => {
      setAdmin(null); // Clear auth state
    };

    eventBus.on('logout', handleLogout);

    return () => {
      eventBus.off('logout', handleLogout);
    };
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.get('/auth/checkAuth');
        const validatedAdmin = response.data;
        if (!validatedAdmin) {
          throw new Error("Account not found")
        }
        setAdmin(validatedAdmin);
      } catch (error) {
        // Optionally, only redirect to login if not already there.
        console.log(error)
        eventBus.emit('logout');
      }
    };

    checkAuth();
  }, [location, navigate]);

  return (
    <AuthContext.Provider value={{ admin, setAdmin }}>
      <Flex direction="column" minH="100vh">
        <Flex flex="1" direction="column">
          <Outlet /> {/* Renders child components inside AuthProvider */}
        </Flex>
        <Footer/>
      </Flex>
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
