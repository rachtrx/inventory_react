import React, { createContext, useContext, useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { api, eventBus } from '../config';

const AuthContext = createContext(null);

export const AuthProvider = () => {
  console.log("Rendering Auth Provider");
  const navigate = useNavigate();
  const location = useLocation();

  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    const handleLogout = () => setAdmin(null);
    
    eventBus.on('logout', handleLogout);
    
    // Clean up the event listener on unmount using the same callback.
    return () => {
      eventBus.off('logout', handleLogout);
    };
  }, []);  

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.get('/auth/checkAuth');
        const validatedAdmin = response.data;
        if (validatedAdmin?.adminName) {
          setAdmin(validatedAdmin);
          // Redirect only if on the login page.
          if (location.pathname === '/login') {
            console.log("IN LOGIN");
            if (!validatedAdmin.canSetupPassword) {
              navigate('/reminders');
            } else {
              navigate('/profile');
            }
          }
        }
      } catch (error) {
        // Optionally, only redirect to login if not already there.
        console.log(error)
        if (location.pathname !== '/login') {
          navigate('/login');
        }
      }
    };

    checkAuth();
  }, [location, navigate]);

  return (
    <AuthContext.Provider value={{ admin, setAdmin }}>
      <Outlet /> {/* Renders child components inside AuthProvider */}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
