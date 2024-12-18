// RecordsLayout.js
import React, { useState, useEffect, useCallback } from 'react';
import { Box, Button, Collapse, Flex, Heading, useBreakpointValue } from '@chakra-ui/react';
import InfoBar from './utils/InfoBar';
import NoDataBox from './utils/NoDataBox';
import CardSkeleton from './utils/CardSkeleton';
import usePagination from '../hooks/usePagination';
import PaginationControls from './Pagination';
import CapsuleToggleButton from './buttons/CapsuleToggleButton';
import { useSearchParams } from 'react-router-dom';
import { FaDownload } from 'react-icons/fa';
import { useResponsive } from '../context/ResponsiveProvider';

import { useItems } from '../context/ItemsProvider';
import { useUI } from '../context/UIProvider';

export default function RecordsLayout({ header, Filters, Actions, Cards, Table }) {

  const { headerSize, isIpad, isMobile } = useResponsive()
  const { handleDevError } = useUI();

  const { items, loading, error } = useItems();

  const [isGridView, setIsGridView] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const initialPage = parseInt(searchParams.get('page'), 10) || 1;
  const itemsPerPage = 30;

  const updateUrl = useCallback((page) => {
    searchParams.set('page', page);
    setSearchParams(searchParams);
  }, [searchParams, setSearchParams]);

  const { currentData, next, prev, currentPage, maxPage } = usePagination(
    items,
    itemsPerPage,
    initialPage,
    updateUrl
  );

  if (loading) return <CardSkeleton />;
  if (error) return <Box>Error: {error.message}</Box>;

  return (
      <>
        <Box p={8} boxShadow="lg" bg="white">
          <Flex 
            justifyContent="space-between" 
            alignItems="center" 
            gap={{ base: "1rem", md: "2rem", lg: "3rem" }}
          >
            <Heading as="h1" size={headerSize}>{header}</Heading>
            <Actions/>
            { isIpad ? (<Button colorScheme="blue" iconSpacing={0} onClick={handleDevError}>
              <FaDownload/>
            </Button>) : (
              <Button colorScheme="blue" onClick={handleDevError}>Export to Excel</Button>
            )}
          </Flex>
        </Box>
        
        <Box p={4}>
          <Filters/>
        </Box>
        <Flex p={4} justifyContent="space-around">
          <InfoBar count={items.length} />
          <CapsuleToggleButton isGridView={isGridView} setIsGridView={setIsGridView} />
        </Flex>
        {!currentData || currentData.length === 0 ? <NoDataBox /> : isGridView ? <Cards items={currentData} /> : <Table items={currentData}/>}
        <PaginationControls currentPage={currentPage} maxPage={maxPage} next={next} prev={prev}/>
        {/* <FormModal />
        <ItemDrawer /> */}
      </>
      
  );
}