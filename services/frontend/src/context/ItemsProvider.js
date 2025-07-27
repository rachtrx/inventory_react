import React, { createContext, useState, useEffect, useCallback } from 'react';
import { dateTimeObject } from '../config';
import { useContext, useMemo } from 'react';
import { useUI } from './UIProvider';
import { useLoading } from './LoadingProvider';
import { useSearchParams } from 'react-router-dom';
import { useModal } from '@chakra-ui/react';
import { useFormModal } from './ModalProvider';

// Create a context for assets
const ItemsContext = createContext();

// Devices Provider component
export const ItemsProvider = ({ children, service, idField, initSortField, initSortOrder="asc" }) => {
  console.log("rendering items provider");
  const [data, setData] = useState([]);
  const { handleError } = useUI();
  const { setLoading } = useLoading();
  const { refreshKey, triggerRefresh } = useFormModal();
  
  const [searchParams, setSearchParams] = useSearchParams();
  const initialPage = parseInt(searchParams.get('page'), 10) || 1;
  const [itemsPerPage, setItemsPerPage] = useState(100);

  const [filters, setFilters] = useState(service.defaultFilters);
  const [searchFilters, setSearchFilters] = useState(service.defaultFilters);
  const [page, setPage] = useState(initialPage || 1);
  const [maxPage, setMaxPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [sortField, setSortField] = useState(initSortField);
  const [sortOrder, setSortOrder] = useState(initSortOrder);

  // useEffect(() => {
  //   console.log(filters);
  // }, [filters]);

  // useEffect(() => {
  //   console.log(searchFilters);
  // }, [searchFilters]);
  
  // useEffect(() => {
  //   console.log(data);
  // }, [data]);

  const updateUrl = useCallback((page) => {
    searchParams.set('page', page);
    setSearchParams(searchParams);
  }, [searchParams, setSearchParams]);

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

  const handleUpdate = async (itemId, name, newValue) => {
		try {
			await service.updateItem({itemId, name, newValue})
			triggerRefresh();
		} catch (err) {
      console.error(err);
      handleError(err);
    }
	};

  const fetchAllFilters = useCallback(async () => {
    try {
      const response = await service.getAllFilters();
      const filterOptionsDict = response.data;
      setFilters((prevFilters) => ({
        ...prevFilters, // Keep existing filters
        ...filterOptionsDict, // Merge new filter options
      }));
    
    } catch (error) {
      handleError(`Error fetching all filters: ${error.message}`);
    }
  }, [handleError, service]);

  useEffect(() => {
    fetchAllFilters()
  }, [fetchAllFilters]);

  const downloadExcel = async () => {
    try {
      setLoading(true);
      const response = await service.downloadExcel({
        filters: searchFilters,
        sort: sortField ? [sortField, sortOrder] : undefined,
      });
  
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
  
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'logs.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
  
      setLoading(false);
    } catch (error) {
      setLoading(false);
      handleError(error);
    }
  };

  useEffect(() => {
    const reload = async () => {
      try {
        setLoading(true);
        console.log(searchFilters);
        const response = await service.loadItems({
          filters: searchFilters,
          sort: sortField ? [sortField, sortOrder] : undefined,
          page,
          pageSize: itemsPerPage,
        });
        console.log(response.data.totalPages);
        console.log(response.data.totalCount);
        console.log(response.data?.data?.slice(0, 10));
        setData(response.data.data);
        setMaxPage(response.data.totalPages);
        setTotalCount(response.data.totalCount);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        handleError(error);
      }
    }
    reload();;
  }, [searchFilters, page, itemsPerPage, service, sortOrder, sortField, handleError, setLoading, refreshKey]);

  const handleSort = (key) => {
    const isSameKey = key === sortField;
    if (!isSameKey) {
      setSortField(key);
      setSortOrder("desc")
    }
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  return (
    <ItemsContext.Provider value={{ 
      defaultFilters: service.defaultFilters,
      handleUpdate,
      filters, 
      setFilters,
      handleSort,
      sortField,
      sortOrder,
      fetchAllFilters,
      setSearchFilters,
      downloadExcel,
      data,
      totalCount,
      maxPage,
      page,
      setPage,
      next,
      prev,
      jump,
      itemsPerPage,
      setItemsPerPage
    }}>
      {children}
    </ItemsContext.Provider>
  );
}

export const useItems = () => useContext(ItemsContext);