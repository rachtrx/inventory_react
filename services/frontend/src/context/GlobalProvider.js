import React, { createContext, useState, useEffect } from 'react';
import { dateTimeObject } from '../config';
import { useContext, useMemo } from 'react';
import assetService from '../services/AssetService';
import { useUI } from './UIProvider';
import userService from '../services/UserService';

// Create a context for assets
const GlobalContext = createContext();

const initialAssetFilters = {
  variant: [],
  age: [],
  assetType: [],
  location: [],
  vendor: [],
  status: [],
  assetTag: [],
  serialNumber: [],
}

const initialUserFilters = {
  name: [],
  department: [],
  assetCount: [],
}

const populateFilters = (data, initialFilters) => {
  const newFilters = { ...initialFilters };
  data.forEach(item => {
    Object.keys(newFilters).forEach(key => {
      if (item[key]) {
        const existingOption = newFilters[key].find(option => option.value === item[key]);
        if (!existingOption) {
          newFilters[key].push({ value: item[key], label: item[key], disabled: false });
        }
      }
    });
  });
  return newFilters;
};

// Devices Provider component
export const GlobalProvider = ({ children }) => {
  const [assets, setAssets] = useState([]);
  const [users, setUsers] = useState([]);
  const [assetFilters, setAssetFilters] = useState(initialAssetFilters);
  const [userFilters, setUserFilters] = useState(initialUserFilters);
  const { loading, setLoading, error, setError } = useUI();

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        const assetResponse = await assetService.loadAssets();
        const assets = assetResponse.data;
        console.log(assets.slice(1, 10));
        setAssets(assets);

        const userResponse = await userService.loadUsers();
        const users = userResponse.data;
        console.log(users.slice(1, 10));
        setUsers(users);

      } catch (err) {
        setError(err);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [setError, setLoading]); // Run this effect only once on mount

  useEffect(() => {
    const newAssetFilters = populateFilters(assets, initialAssetFilters);
    console.log(newAssetFilters);
    setAssetFilters(newAssetFilters);
  }, [assets]);
  
  useEffect(() => {
    const newUserFilters = populateFilters(users, initialUserFilters);
    console.log(newUserFilters);
    setUserFilters(newUserFilters);
  }, [users]);

  const handleToggle = async (id, isBookmarked, service, setState) => {
    setLoading(true);
    try {
      await service.bookmark(id, !isBookmarked);
  
      setState(prevItems => 
        prevItems.map(item =>
          item.id === id ? { ...item, bookmarked: !isBookmarked } : item
        )
      );
    } catch (err) {
      console.log(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleAssetToggle = (id, isBookmarked) => {
    handleToggle(id, isBookmarked, assetService, setAssets);
  };
  
  const handleUserToggle = (id, isBookmarked) => {
    handleToggle(id, isBookmarked, userService, setUsers);
  };

  return (
    <GlobalContext.Provider value={{ assets, setAssets, assetFilters, setAssetFilters, handleAssetToggle, users, setUsers, userFilters, setUserFilters, handleUserToggle }}>
      {children}
    </GlobalContext.Provider>
  );
}

export const useGlobal = () => useContext(GlobalContext);