import React from 'react';
import { Box } from '@chakra-ui/react';
import EventFilters from './EventFilters';
import EventTable from './EventTable';
import { ItemsProvider } from '../../context/ItemsProvider';
import RecordsLayout from '../RecordsLayout';
import EventCards from './EventCards';
import eventService from '../../services/EventService';
import EventActions from './EventActions';

export const EventsPage = () => {

  return (
    <ItemsProvider service={eventService} initSortField="eventDate" initSortOrder="desc" itemKey="eventId">
      <RecordsLayout
        header="Events"
        Filters={EventFilters}
        Actions={EventActions}
        Cards={EventCards}
        Table={EventTable}
        defaultSearches={[
          { attr: "serialNumber", label: "asset"},
          { attr: "userName", label: "user"}
        ]}
      />
    </ItemsProvider>
  );
}
