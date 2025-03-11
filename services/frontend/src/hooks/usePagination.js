import { useEffect, useState, useCallback  } from 'react';
import { useItems } from '../context/ItemsProvider';

function usePagination(data, itemsPerPage, initialPage, updateUrl) {
  const [currentPage, setCurrentPage] = useState(initialPage || 1);
  const [currentData, setCurrentData] = useState([]);
  const [maxPage, setMaxPage] = useState(1);

  const [sortField, setSortField] = useState("typeName");
  const [sortOrder, setSortOrder] = useState("asc");

  const { setItems } = useItems();

  useEffect(() => {
    console.log(currentData);
  }, [currentData]);

  useEffect(() => {
    // console.log(data)
    if (data) {
      const calculatedMaxPage = Math.ceil(data.length / itemsPerPage) || 1;
      setMaxPage(calculatedMaxPage);
      const startIdx = (currentPage - 1) * itemsPerPage;
      const endIdx = startIdx + itemsPerPage;
      const pageData = data.slice(startIdx, endIdx)
      console.log(pageData);
      setCurrentData(pageData);
    }
  }, [data, currentPage, itemsPerPage]);

  useEffect(() => {
    updateUrl(currentPage);
  }, [currentPage, updateUrl]);

  const next = useCallback(() => {
    setCurrentPage((currentPage) => Math.min(currentPage + 1, maxPage));
  }, [maxPage]);

  const prev = useCallback(() => {
    setCurrentPage((currentPage) => Math.max(currentPage - 1, 1));
  }, []);

  const jump = useCallback((page) => {
    const pageNumber = Math.max(1, page);
    setCurrentPage(() => Math.min(pageNumber, maxPage));
  }, [maxPage]);

  const fetchItems = async () => {
    try {
      const response = await 
      setItems(response.data);
      setMaxPage(data.totalPages);
    } catch (error) {
      console.error("Failed to fetch assets", error);
    }
  };

  const handleSort = (key) => {
    setSortField(key);
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };


  return { next, prev, jump, currentData, currentPage, maxPage };
}

export default usePagination;