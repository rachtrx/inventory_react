// DataDisplayComponent.js
import React from 'react';
import { Box, Flex } from '@chakra-ui/react';
import FormDrawer from './components/FormDrawer';
import InfoBar from './components/InfoBar';
import NoDataBox from './components/NoDataBox';
import CardSkeleton from './components/CardSkeleton';
import Headers from './components/Headers';
import usePagination from '../hooks/usePagination';
import PaginationControls from './components/Pagination';

export default function DataDisplayComponent({ dataKey, data, loading, error, Filters, Actions, Cards }) {
  
  const itemsPerPage = 30;
  const { currentData, next, prev, currentPage, maxPage } = usePagination(data, itemsPerPage);

  if (loading) return <CardSkeleton />;
  if (error) return <Box>Error: {error.message}</Box>;

  return (
      <Flex flexDirection='column' minWidth='max-content' alignItems='stretch' gap='2'>
        <Box className="devices" p={8} boxShadow="lg" bg="white">
          <Headers header={dataKey}/>
          <Filters filters={data.filters} />
        </Box>
        <InfoBar count={data.length} />
        <Actions />
        {!currentData || currentData.length === 0 ? <NoDataBox /> : <Cards items={currentData.items || []} />}
        <PaginationControls currentPage={currentPage} maxPage={maxPage} next={next} prev={prev}/>
        <FormDrawer/>
      </Flex>
      
  );
}