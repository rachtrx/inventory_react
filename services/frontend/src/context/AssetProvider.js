import React, { createContext, useState, useEffect } from 'react';
import { dateTimeObject } from '../config';
import AssetService from '../services/AssetService';
import { useContext, useMemo } from 'react';
import { useAuth } from './AuthProvider';

// Create a context for assets
export const AssetContext = createContext();

// Devices Provider component
export const AssetProvider = ({ children }) => {
  const [assets, setAssets] = useState([]);
  const [filters, setFilters] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10, totalItems: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { axios } = useAuth()

  const assetService = useMemo(() => {
    return new AssetService(axios);
  }, [axios]);

  const createAssetObject = function(device) {
    return {
      assetId: device.asset_id || device.id,
      serialNumber: device.serial_number,
      assetTag: device.asset_tag,
      modelName: device.model_name,
      bookmarked: device.device_bookmarked || device.bookmarked || 0,
      status: device.status,
      vendorName: device.vendor_name,
      modelValue: String(parseFloat(device.model_value).toFixed(2)) || 'Unspecified',
      ...(device.registered_date && {registeredDate: Intl.DateTimeFormat('en-sg', dateTimeObject).format(new Date(device.registered_date))}),
      ...(device.user_name && {userName: device.user_name}),
      ...(device.user_id && {userId: device.user_id}),
      ...(device.user_bookmarked && {userbookmarked: device.user_bookmarked}),
      ...(device.device_type && {deviceType: device.device_type}),
      ...(device.location && {location: device.location}),
      ...(device.device_age && {deviceAge: device.device_age}),
      ...(device.device_type && {deviceType: device.device_type})
    }
  }

  useEffect(() => {
    assetService.loadAssetFilters()
      .then(response => response.json())
      .then(({ filters }) => {
        setFilters(filters)
      }).catch(err => {
        setError(err);
        setLoading(false);
      })
  })

  useEffect(() => {
    assetService.loadAssets(filters)
      .then(response => response.json())
      .then(results => {
        const assets = results.map(asset => createAssetObject(asset));
        setAssets(assets);
        setPagination(prev => ({ ...prev, totalItems: results.total }));
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  }, [filters, assetService]);

  return (
    <AssetContext.Provider value={{ assets, setAssets, filters, setFilters, loading, error }}>
      {children}
    </AssetContext.Provider>
  );
};

export const useAsset = () => useContext(AssetContext);