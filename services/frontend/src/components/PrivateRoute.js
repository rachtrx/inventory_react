import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthProvider';
import { Outlet } from 'react-router-dom'; // Outlet for nested routes
import Layout from './Layout'; // Assuming Layout is a component

export const PrivateRoute = () => {
  const { checkAuth, user } = useAuth();

  useEffect(() => {
		console.log("performing check in private route");
		console.log(`User: ${user}`);
    const performCheck = async () => {
			await checkAuth() // will logout automatically through axios
    };

    performCheck(); // Run immediately on component mount

    const interval = setInterval(() => {
      console.log("Periodic auth check");
      performCheck();
    }, 300000); // Every 5 minutes

    return () => {
      clearInterval(interval); // Cleanup the interval on component unmount
    };
  }, [checkAuth, user]); // Dependency on checkAuth to avoid re-creating interval unnecessarily

  return (
    <>
      <Layout />
      <Outlet />
    </>
  );
};