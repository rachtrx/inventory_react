import React, { createContext, useState, useEffect } from 'react';
import { dateTimeObject } from '../config';
import { useContext, useMemo } from 'react';
import assetService from '../services/AssetService';

// Create a context for assets
const AssetContext = createContext();

const initialFilters = {
  variant: [],
  age: [],
  assetType: [],
  location: [],
  vendor: []
}

// Devices Provider component
export const AssetProvider = ({ children }) => {
  const [assets, setAssets] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10, totalItems: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAssets = async () => {
      setLoading(true);
      try {
        const response = await assetService.loadAssets();
        const assets = response.data;
        setAssets(assets);
        setPagination(prev => ({ ...prev, totalItems: assets.length }));
      } catch (err) {
        setError(err);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
  }, []); // Run this effect only once on mount

  useEffect(() => {
    console.log(assets.splice(1, 10));
    const newFilters = initialFilters;
    // Populate the new filters with unique values from assets
    assets.forEach(asset => {
      Object.keys(newFilters).forEach(key => {
        if (asset[key] && !newFilters[key].includes(asset[key])) {
          newFilters[key].push(asset[key]);
        }
      });
    });

    console.log(newFilters);
    setFilters(newFilters);
  }, [assets]);

  return (
    <AssetContext.Provider value={{ assets, setAssets, filters, setFilters, loading, error }}>
      {children}
    </AssetContext.Provider>
  );
}

export const useAsset = () => useContext(AssetContext);