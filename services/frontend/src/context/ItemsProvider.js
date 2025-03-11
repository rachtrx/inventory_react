import React, { createContext, useState, useEffect, useCallback } from 'react';
import { dateTimeObject } from '../config';
import { useContext, useMemo } from 'react';
import { useUI } from './UIProvider';
import { useLoading } from './LoadingProvider';
import usePagination from '../hooks/usePagination';
import { useSearchParams } from 'react-router-dom';

// Create a context for assets
const ItemsContext = createContext();

// Devices Provider component
export const ItemsProvider = ({ children, service, idField }) => {
  console.log("rendering items provider");
  const [data, setData] = useState([]);
  const { handleError } = useUI();
  const { setLoading } = useLoading();
  
  const [searchParams, setSearchParams] = useSearchParams();
  const initialPage = parseInt(searchParams.get('page'), 10) || 1;
  const itemsPerPage = 30;

  const [filters, setFilters] = useState(service.defaultFilters);
  const [searchFilters, setSearchFilters] = useState(service.defaultFilters);
  const [page, setPage] = useState(initialPage || 1);
  const [maxPage, setMaxPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [sortField, setSortField] = useState("typeName");
  const [sortOrder, setSortOrder] = useState("asc");

  const updateUrl = useCallback((page) => {
    searchParams.set('page', page);
    setSearchParams(searchParams);
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    console.log(filters);
  }, [filters]);

  useEffect(() => {
    console.log(searchFilters);
  }, [searchFilters]);
  
  useEffect(() => {
    console.log(data);
  }, [data]);

  useEffect(() => {
    updateUrl(page);
  }, [page, updateUrl]);

  const next = useCallback(() => {
    setPage((page) => Math.min(page + 1, maxPage));
  }, [maxPage]);

  const prev = useCallback(() => {
    setPage((page) => Math.max(page - 1, 1));
  }, []);

  const jump = useCallback((page) => {
    const pageNumber = Math.max(1, page);
    setPage(() => Math.min(pageNumber, maxPage));
  }, [maxPage]);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await service.loadItems({
          filters: searchFilters,
          ...(sortField && {sortField}),
          ...(sortField && {sortOrder}),
          page,
          pageSize: itemsPerPage,
        });
        console.log(response.data.totalPages);
        console.log(response.data.totalCount);
        setData(response.data.data);
        setMaxPage(response.data.totalPages);
        setTotalCount(response.data.totalCount)
      } catch (error) {
        console.error("Failed to fetch assets", error);
      }
    };
    fetchItems();
  }, [searchFilters, page, service, sortOrder, sortField]);

  const handleSort = (key) => {
    setSortField(key);
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const handleUpdate = useCallback(async (id, field, newValue) => {
    const value = newValue;
    console.log(value);
    setLoading(true);
    try {
      await service.updateItem(id, field, newValue);
      setData(prevItems => 
        prevItems.map(item =>item[idField] === id ? { ...item, [field]: value } : item)
      );
    } catch (err) {
      console.log(err);
      handleError(err); // Call handleError to handle the error
    } finally {
      setLoading(false);
    }
  }, [handleError, service, setLoading, idField]);

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

  return (
    <ItemsContext.Provider value={{ 
      filters, 
      setFilters,
      handleUpdate,
      handleSort,
      fetchFilters,
      setSearchFilters,
      data,
      totalCount,
      maxPage,
      page,
      next,
      prev,
      jump,
    }}>
      {children}
    </ItemsContext.Provider>
  );
}

export const useItems = () => useContext(ItemsContext);