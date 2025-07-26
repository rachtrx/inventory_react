import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthProvider';
import { Navigate, Outlet } from 'react-router-dom';
import Nav from './Nav';
import { ModalProvider } from '../context/ModalProvider';
import { DrawerProvider } from '../context/DrawerProvider';
import ItemDrawer from './ItemDrawer';
import FormModal from './forms/control/FormModal';

export const PrivateLayout = () => {
  const { admin } = useAuth();

  return admin ? (
    <div>
      <Nav />
      <main>
        <ModalProvider>
          <FormModal />
          <DrawerProvider>
            <ItemDrawer />
            <Outlet />
          </DrawerProvider>
        </ModalProvider>
      </main>
    </div>
  ) : null;
};
