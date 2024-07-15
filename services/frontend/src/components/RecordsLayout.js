// RecordsLayout.js
import React, { useState, useEffect, useCallback } from 'react';
import { Box, Button, Collapse, Flex, Heading, useBreakpointValue } from '@chakra-ui/react';
import InfoBar from '../pages/components/InfoBar';
import NoDataBox from '../pages/components/NoDataBox';
import CardSkeleton from '../pages/components/CardSkeleton';
import usePagination from '../hooks/usePagination';
import PaginationControls from '../pages/components/Pagination';
import { FormProvider } from '../context/FormProvider';
import CapsuleToggleButton from './buttons/CapsuleToggleButton';
import { useSearchParams } from 'react-router-dom';
import { FaDownload } from 'react-icons/fa';
import { useResponsive } from '../context/ResponsiveProvider';

import FormDrawer from './FormDrawer';
import ToggleButton from './buttons/ToggleButton';

export default function RecordsLayout({ header, data, loading, error, Filters, Actions, Cards, Table }) {

  const { headerSize, isIpad, isMobile } = useResponsive()

  const [isGridView, setIsGridView] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const initialPage = parseInt(searchParams.get('page'), 10) || 1;
  const itemsPerPage = 30;

  const updateUrl = useCallback((page) => {
    searchParams.set('page', page);
    setSearchParams(searchParams);
  }, [searchParams, setSearchParams]);

  const { currentData, next, prev, currentPage, maxPage } = usePagination(
    data,
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
            <FormProvider>
              <Actions/>
              <FormDrawer />
            </FormProvider>
            { isIpad ? (<Button colorScheme="blue" iconSpacing={0}>
              <FaDownload/>
            </Button>) : (
              <Button colorScheme="blue">Export to Excel</Button>
            )}
          </Flex>
        </Box>
        
        <Box p={4}>
          <Filters/>
        </Box>
        <Flex p={4} justifyContent="space-around">
          <InfoBar count={data.length} />
          <CapsuleToggleButton isGridView={isGridView} setIsGridView={setIsGridView} />
        </Flex>
        {!currentData || currentData.length === 0 ? <NoDataBox /> : isGridView ? <Cards items={currentData} /> : <Table items={currentData}/>}
        <PaginationControls currentPage={currentPage} maxPage={maxPage} next={next} prev={prev}/>
      </>
      
  );
}