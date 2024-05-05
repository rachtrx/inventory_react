import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { checkAuthStatus } from './redux/actions/auth';
import Nav from './components/Nav';


export default function AuthenticatedLayout() {
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  console.log(`is logged in: ${isLoggedIn}`);
  const dispatch = useDispatch();
  const navigate = useNavigate()

  console.log("TEST");

  useEffect(() => {
    const checkUser = async () => {
      try {
        await dispatch(checkAuthStatus()); // Dispatch an action to update your auth state
        if (isLoggedIn) {
          navigate('/dashboard', { replace: true });
          console.log("logged in!");
        }
      } catch {
        navigate('/auth/login', { replace: true });
        console.log('Not logged in');
      }
    };
    checkUser();
  }, [dispatch, isLoggedIn, navigate]);

  return (
    <div>
      
      
    </div>
  );
};
