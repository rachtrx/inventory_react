import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthProvider';
import { Outlet, useLocation, useNavigate } from 'react-router-dom'; // Outlet for nested routes
import Nav from './Nav';
import { ModalProvider } from '../context/ModalProvider';
import { DrawerProvider } from '../context/DrawerProvider';
import { ItemsProvider } from '../context/ItemsProvider';
import FormModal from './FormModal';
import ItemDrawer from './ItemDrawer';
import authService from '../services/AuthService';
import { useUI } from '../context/UIProvider';
import { useMsal } from '@azure/msal-react';

export const PrivateLayout = () => {
  const { setAdmin,  admin } = useAuth();
  const { handleError } = useUI()
  const navigate = useNavigate()

  console.log('Rendering Private Route');

  const { instance } = useMsal()
  useEffect(() => {
    const account = instance.getActiveAccount();
    console.log(account);
  })

  useEffect(() => {

    const performAuthCheck = async () => {
      try {
        const response = await authService.checkAuth();
        if (!admin) setAdmin(response.data)
      } catch (error) {
        if (admin) handleError("Your session has timed out, please login again");
        setAdmin(null);
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
  }, [navigate, admin, setAdmin, handleError]);

  return (
    admin &&
    (<div>
      <Nav/>
      <main>
        <ModalProvider>
          <DrawerProvider>
              <Outlet />
              <FormModal />
              <ItemDrawer />
          </DrawerProvider>
        </ModalProvider>
      </main>
    </div>)
  );
};