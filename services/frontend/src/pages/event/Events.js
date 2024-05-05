import React from 'react';
import { Box } from '@chakra-ui/react';
import EventFilters from './EventFilters';
import Pagination from "../components/Pagination";
import NoDataBox from "../components/NoDataBox";
import CardSkeleton from '../components/CardSkeleton';
import useFetchData from '../../hooks/useFetchData'; // Import the custom hook
import FilterBox from '../forms/utils/FilterBox';
import EventTable from './EventTable';
import { loadAllEvents } from '../../redux/actions/event';

export default function Events() {
  const { loading, error, data: events } = useFetchData(loadAllEvents, state => state.events);

  if (loading) return <CardSkeleton />;
  if (error) return <Box>Error: {error.message}</Box>;

  return (
    <>
      <FilterBox>
        <EventFilters filters={events.filters} />
      </FilterBox>

      {events.events.length === 0 ? <NoDataBox /> : <EventTable events={events} />}
      <Pagination />
    </>
  );
}
