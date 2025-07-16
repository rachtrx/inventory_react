// RecordsLayout.js
import React, { useState, useEffect, useCallback } from 'react';
import { Box, Button, Collapse, Flex, Heading, IconButton, useBreakpointValue, useDisclosure } from '@chakra-ui/react';
import InfoBar from './utils/InfoBar';
import NoDataBox from './utils/NoDataBox';
import CardSkeleton from './utils/CardSkeleton';
import PaginationControls from './Pagination';
import CapsuleToggleButton from './buttons/CapsuleToggleButton';
import { useSearchParams } from 'react-router-dom';
import { FaDownload, FaSearch, FaTimes, FaTools } from 'react-icons/fa';
import { useResponsive } from '../context/ResponsiveProvider';

import { useItems } from '../context/ItemsProvider';
import { useUI } from '../context/UIProvider';
import { useLoading } from '../context/LoadingProvider';
import { Form, Formik } from 'formik';
import FilterSidebar from './utils/FilterSidebar';
import ActionSidebar from './utils/ActionSidebar';
import FloatingButtons from './buttons/FloatingButtons';
import { useFormModal } from '../context/ModalProvider';
import SearchBar from './utils/SearchBar';

export default function RecordsLayout({ header, Filters, Actions, Cards, Table, defaultSearches=[] }) {

  const { headerSize, isIpad } = useResponsive()
  const { handleDevError } = useUI();
  const { loading } = useLoading();

  const { data, totalCount, page, maxPage, next, prev, defaultFilters, setSearchFilters, downloadExcel } = useItems();

  const [isGridView, setIsGridView] = useState(false);

  const {
    isOpen: isFilterOpen,
    onOpen: onFilterOpen,
    onClose: onFilterClose,
  } = useDisclosure();
  
  const [isOpen, setIsOpen] = useState(false);

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
                icon={<FaSearch />}
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
        
        <Flex p={4} gap={1} justifyContent="space-around" alignItems="center">
          {defaultSearches?.length > 0 && (
              <Flex gap={1}>{
                defaultSearches.map(({ attr, label }, idx) => (
                  <SearchBar key={idx} attr={attr} label={label}/>
                ))
              }
            </Flex>)
          }
          <InfoBar count={totalCount}/>
          <CapsuleToggleButton isGridView={isGridView} setIsGridView={setIsGridView} />
        </Flex>
        {loading ? <CardSkeleton /> : 
          totalCount === 0 ? <NoDataBox /> : 
          isGridView ? <Cards items={data} /> : 
          <Table items={data}/>}
        
        <PaginationControls 
          currentPage={page} 
          maxPage={maxPage} 
          next={next} 
          prev={prev}
        />
      </>
  );
}