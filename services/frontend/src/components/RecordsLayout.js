// RecordsLayout.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Box, Button, Collapse, Flex, Heading, IconButton, SimpleGrid, Tooltip, useBreakpointValue, useDisclosure } from '@chakra-ui/react';
import InfoBar from './utils/InfoBar';
import NoDataBox from './utils/NoDataBox';
import CardSkeleton from './utils/CardSkeleton';
import PaginationControls from './Pagination';
import CapsuleToggleButton from './buttons/CapsuleToggleButton';
import { FaDownload, FaSlidersH, FaTimes, FaTools } from 'react-icons/fa';
import { useResponsive } from '../context/ResponsiveProvider';

import { useItems } from '../context/ItemsProvider';
import { useLoading } from '../context/LoadingProvider';
import { Form, Formik } from 'formik';
import FilterSidebar from './utils/FilterSidebar';
import ActionSidebar from './utils/ActionSidebar';
import SearchBar from './utils/SearchBar';
import { MdRefresh } from 'react-icons/md';

export default function RecordsLayout({ header, Filters, Actions, Cards, Table, defaultSearches=[] }) {

  const { headerSize, isIpad } = useResponsive()
  const { loading } = useLoading();

  const { data, totalCount, defaultFilters, setSearchFilters, downloadExcel } = useItems();

  const [isGridView, setIsGridView] = useState(false);

  const {
    isOpen: isFilterOpen,
    onOpen: onFilterOpen,
    onClose: onFilterClose,
  } = useDisclosure();
  
  const [isOpen, setIsOpen] = useState(false);
  const [resetFlag, setResetFlag] = useState(0);

  const handleReset = () => {
    setSearchFilters(defaultFilters);
    setResetFlag((prev) => prev + 1);
  };

  return (
      <>
        <Box p={8} boxShadow="lg" bg="white">
          <Flex 
            justifyContent="space-between" 
            alignItems="center" 
            gap={{ base: "1rem", md: "2rem", lg: "3rem" }}
          >
            <Flex gap={2}>
              <Box position="relative">
                <IconButton
                  onClick={() => setIsOpen(!isOpen)}
                  colorScheme="blue"
                  icon={isOpen ? <FaTimes/> : <FaTools />}
                  aria-label={`Manage ${header}`}
                  isRound
                  size="md"
                />
                <ActionSidebar isOpen={isOpen} setIsOpen={setIsOpen}>
                  <Actions />
                </ActionSidebar>
              </Box>
              <IconButton
                onClick={onFilterOpen}
                colorScheme="blue"
                icon={<FaSlidersH />}
                aria-label="Filter"
                isRound
                size="md"
              />
            </Flex>
            <Heading as="h1" size={headerSize}>{header}</Heading>
            { isIpad ? (
              <Button colorScheme="blue" iconSpacing={0} onClick={downloadExcel}>
                <FaDownload/>
              </Button>
            ) : (
              <Button colorScheme="blue" onClick={downloadExcel}>Export to Excel</Button>
            )}
          </Flex>
        </Box>

        <Box>
          <Formik
              initialValues={defaultFilters}
              onSubmit={(values) => setSearchFilters(values)}
          >
            <Form>
              <FilterSidebar isOpen={isFilterOpen} onClose={onFilterClose}>
                <Filters />
              </FilterSidebar>
            </Form>
          </Formik>
        </Box>
        
        <Flex spacing={2} p={4} gap={1} justifyContent="space-around" alignItems="center">

          <Tooltip label="Reset All Filters">
            <IconButton
              aria-label="Reset"
              size="sm"
              icon={<MdRefresh />}
              variant="outline"
              colorScheme="gray"
              onClick={handleReset}
            />
          </Tooltip>

          {defaultSearches?.length > 0 && (
              <Flex gap={2}>{
                defaultSearches.map(({ attr, label }, idx) => (
                  <SearchBar 
                    key={idx} 
                    attr={attr} 
                    label={label} 
                    resetFlag={resetFlag}
                  />
                ))
              }
            </Flex>
            )
            
          }
          <InfoBar count={totalCount}/>
          <CapsuleToggleButton isGridView={isGridView} setIsGridView={setIsGridView} />
        </Flex>
        {loading ? <CardSkeleton /> : 
          totalCount === 0 ? <NoDataBox /> : 
          isGridView ? <Cards items={data} /> : 
          <Table items={data}/>}
        
        <PaginationControls/>
      </>
  );
}