import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthProvider';
import { Outlet } from 'react-router-dom'; // Outlet for nested routes
import Nav from './Nav';

export const PrivateLayout = () => {
  const { checkAuth } = useAuth();

  console.log('Rendering Private Route');

  useEffect(() => {

    console.log('useEffect triggered');

    const performCheck = async () => {
      console.log("Performing Check");
      await checkAuth();
    };

    performCheck(); // Run immediately on component mount

    const interval = setInterval(() => {
      console.log("Periodic auth check");
      performCheck();
    }, 300000); // Every 5 minutes

    return () => {
      clearInterval(interval); // Cleanup the interval on component unmount
    };
  }, [checkAuth]);

  return (
    <div>
      <Nav/>

      <main>
        <Outlet />
      </main>
    </div>
  );
};