import React, { createContext, useState, useEffect, useContext } from 'react';
import userService from '../services/UserService';
import { useUI } from './UIProvider';

// Create a context for assets
const UserContext = createContext();

const initialFilters = {
  department: [],
  assetCount: []
}

// Devices Provider component
export const UserProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10, totalItems: 0 });
  const { loading, setLoading, error, setError } = useUI()

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await userService.loadUsers();
        const users = response.data;
        setUsers(users);
        setPagination(prev => ({ ...prev, totalItems: users.length }));
      } catch (err) {
        setError(err);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []); 

  useEffect(() => {
    const newFilters = initialFilters;
    console.log(users.splice(1, 10));

    users.forEach(user => {
      Object.keys(newFilters).forEach(key => {
        if (user[key] && !newFilters[key].includes(user[key])) {
          newFilters[key].push(user[key]);
        }
      });
    });

    console.log(newFilters);
    setFilters(newFilters);
  }, [users]);

  return (
    <UserContext.Provider value={{ users, setUsers, filters, setFilters, loading, error }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);