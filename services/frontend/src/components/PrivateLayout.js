import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthProvider';
import { Navigate, Outlet } from 'react-router-dom';
import Nav from './Nav';
import { FormProvider } from '../context/FormProvider';
import { DrawerProvider } from '../context/DrawerProvider';
import ItemDrawer from './ItemDrawer';
import { FormModalProvider } from './forms/control/FormModalProvider';

export const PrivateLayout = () => {
  const { admin } = useAuth();

  return admin ? (
    <div>
      <Nav />
      <main>
        <FormProvider>
          <FormModalProvider>
            <DrawerProvider>
              <ItemDrawer />
              <Outlet />
            </DrawerProvider>
          </FormModalProvider>
        </FormProvider>
      </main>
    </div>
  ) : null;
};
