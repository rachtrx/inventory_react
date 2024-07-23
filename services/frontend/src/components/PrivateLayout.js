import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthProvider';
import { Outlet, useLocation, useNavigate } from 'react-router-dom'; // Outlet for nested routes
import Nav from './Nav';
import { ModalProvider } from '../context/ModalProvider';
import { DrawerProvider } from '../context/DrawerProvider';
import { GlobalProvider } from '../context/GlobalProvider';
import FormModal from './FormModal';
import ItemDrawer from './ItemDrawer';
import authService from '../services/AuthService';
import { useUI } from '../context/UIProvider';

export const PrivateLayout = () => {
  const { setUser,  user } = useAuth();
  const { handleError } = useUI()

  const navigate = useNavigate()

  console.log('Rendering Private Route');

  useEffect(() => {

    const performAuthCheck = async () => {
      try {
        const response = await authService.checkAuth();
        const { userName } = response.data;
        setUser(userName);
      } catch (error) {
        handleError("Your session has timed out, please login again");
        setUser(null);
        navigate('/login', { replace: true });
      };
    }
    performAuthCheck();

    const interval = setInterval(() => {
      console.log("Periodic auth check");
      performAuthCheck();
    }, 300000);

    return () => {
      clearInterval(interval);
    };
  }, [navigate, user, setUser, handleError]);

  return (
    user &&
    (<div>
      <Nav/>
      <main>
        <ModalProvider>
          <DrawerProvider>
            <GlobalProvider>
              <Outlet />
              <FormModal />
              <ItemDrawer />
            </GlobalProvider>
          </DrawerProvider>
        </ModalProvider>
      </main>
    </div>)
  );
};