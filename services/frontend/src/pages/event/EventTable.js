import React from 'react';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td
} from '@chakra-ui/react';

const EventTable = ({events}) => {
    return (
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Asset Tag</Th>
            <Th>Serial Number</Th>
            <Th>Device Type</Th>
            <Th>Model Name</Th>
            <Th>Event</Th>
            <Th>User</Th>
            <Th>Datetime</Th>
          </Tr>
        </Thead>
        <Tbody>
          {events.map((event, index) => (
            <Tr key={index} data-asset-id={event.assetId} data-user-id={event.userId}>
              <Td>{event.assetTag || '-'}</Td>
              <Td>{event.serialNumber || '-'}</Td>
              <Td>{event.deviceType || '-'}</Td>
              <Td>{event.modelName || '-'}</Td>
              <Td>{event.eventType}</Td>
              <Td data-user-id={event.userId}>{event.userName || '-'}</Td>
              <Td>{new Intl.DateTimeFormat('en-sg').format(new Date(event.eventDate))}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    );
  };

export default EventTable;