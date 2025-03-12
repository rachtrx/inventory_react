// RecordsLayout.js
import React, { useState, useEffect, useCallback } from 'react';
import { Box, Button, Collapse, Flex, Heading, useBreakpointValue } from '@chakra-ui/react';
import InfoBar from './utils/InfoBar';
import NoDataBox from './utils/NoDataBox';
import CardSkeleton from './utils/CardSkeleton';
import PaginationControls from './Pagination';
import CapsuleToggleButton from './buttons/CapsuleToggleButton';
import { useSearchParams } from 'react-router-dom';
import { FaDownload } from 'react-icons/fa';
import { useResponsive } from '../context/ResponsiveProvider';

import { useItems } from '../context/ItemsProvider';
import { useUI } from '../context/UIProvider';
import { useLoading } from '../context/LoadingProvider';
import { Form, Formik } from 'formik';
import FilterSidebar from './utils/FilterSidebar';

export default function RecordsLayout({ header, Filters, Actions, Cards, Table }) {

  const { headerSize, isIpad } = useResponsive()
  const { handleDevError } = useUI();

  const { data, totalCount, page, maxPage, next, prev, defaultFilters, setSearchFilters } = useItems();
  const { loading } = useLoading();

  const [isGridView, setIsGridView] = useState(false);

  if (loading) return <CardSkeleton />;

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
          <Formik
              initialValues={defaultFilters}
              onSubmit={(values) => setSearchFilters(values)}
          >
            <Form>
                <FilterSidebar>
                  <Filters />
                </FilterSidebar>
              </Form>
          </Formik>
          
        </Box>
        <Flex p={4} justifyContent="space-around">
          <InfoBar count={totalCount} />
          <CapsuleToggleButton isGridView={isGridView} setIsGridView={setIsGridView} />
        </Flex>
        {!totalCount ? <NoDataBox /> : isGridView ? <Cards items={data} /> : <Table items={data}/>}
        <PaginationControls currentPage={page} maxPage={maxPage} next={next} prev={prev}/>
        {/* <FormModal />
        <ItemDrawer /> */}
      </>
      
  );
}