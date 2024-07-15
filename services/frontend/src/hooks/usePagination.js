import { useEffect, useState, useCallback  } from 'react';

function usePagination(data, itemsPerPage, initialPage, updateUrl) {
  const [currentPage, setCurrentPage] = useState(initialPage || 1);
  const [currentData, setCurrentData] = useState([]);
  const [maxPage, setMaxPage] = useState(1);

  useEffect(() => {
    if (data) {
      const calculatedMaxPage = Math.ceil(data.length / itemsPerPage);
      setMaxPage(calculatedMaxPage);
      const startIdx = (currentPage - 1) * itemsPerPage;
      const endIdx = startIdx + itemsPerPage;
      setCurrentData(data.slice(startIdx, endIdx));
    }
  }, [data, currentPage, itemsPerPage]);

  useEffect(() => {
    if (updateUrl) {
      updateUrl(currentPage);
    }
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

  return { next, prev, jump, currentData, currentPage, maxPage };
}

export default usePagination;