import React, { createContext, useState, useEffect, useCallback } from 'react';
import { dateTimeObject } from '../config';
import { useContext, useMemo } from 'react';
import { useUI } from './UIProvider';

// Create a context for assets
const ItemsContext = createContext();

// Devices Provider component
export const ItemsProvider = ({ children, service }) => {
  const [items, setItems] = useState([]);
  const { loading, setLoading, handleError } = useUI();

  const [filters, setFilters] = useState(service.defaultFilters)

  console.log("rendering items provider");

  useEffect(() => {
    console.log("service changed");
  }, [service]);

  useEffect(() => {
    console.log("setItems changed");
  }, [setItems]);

  useEffect(() => {
    console.log("handleError changed");
  }, [handleError]);

  useEffect(() => {
    console.log("setLoading changed");
  }, [setLoading]);

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        const response = await service.loadItems();
        const items = response.data;
        console.log(items.slice(0, 50));
        setItems(items);
      } catch (err) {
        handleError(err);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [setItems, setLoading, handleError, service]); // Run this effect only once on mount

  const handleUpdate = useCallback(async (id, field, newValue) => {
    const value = newValue;
    setLoading(true);
    try {
      await service.updateItem(id, field, newValue);
      setItems(prevItems => 
        prevItems.map(item =>item.id === id ? { ...item, [field]: value } : item)
      );
    } catch (err) {
      console.log(err);
      handleError(err); // Call handleError to handle the error
    } finally {
      setLoading(false);
    }
  }, [handleError, service, setLoading]);

  const fetchFilters = useCallback(async (filterName) => {
    try {
      const response = await service.getFilters(filterName);
      const filterOptions = response.data;
      setFilters(prevFilters => ({
        ...prevFilters,
        [filterName]: filterOptions
      }));
    } catch (error) {
      handleError(`Error fetching ${filterName} filters: ${error.message}`);
    }
  }, [handleError, service]);

  const onSubmit = useCallback(async (values, actions) => {
    try {
        console.log(values);
        const response = await service.loadItems(values);
        console.log(response.data);	
        setItems(response.data);
    } catch (error) {
        handleError('Error loading assets:', error);
    } finally {
        actions.setSubmitting(false);
    }
  }, [handleError, service])

  return (
    <ItemsContext.Provider value={{ items, setItems, filters, setFilters, handleUpdate, fetchFilters, onSubmit }}>
      {children}
    </ItemsContext.Provider>
  );
}

export const useItems = () => useContext(ItemsContext);