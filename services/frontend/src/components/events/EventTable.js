import React from 'react';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td
} from '@chakra-ui/react';
import { ACTION_COLORS } from '../buttons/constants';
import { AccTypeLink, AssetLink, UserLink } from '../buttons/ItemLink';
import Tags from '../tags/Tags';
const EventTable = ({ items }) => {

  return (
    <Table variant="compact" size="sm">
      <Thead>
        <Tr>
          <Th>Event Type</Th>
          <Th>Event Date</Th>
          <Th>Asset</Th>
          <Th>User</Th>
          <Th>Accessories</Th>
          <Th>Tag</Th>
          <Th>Admin</Th>
        </Tr>
      </Thead>
      <Tbody>
        {items.map((event, index) => (
          <Tr key={index} bg={ACTION_COLORS[event.type]}>
            <Td>{event.type}</Td>
            <Td>{event.eventDate}</Td>
            <Td>{event.asset ? <AssetLink asset={event.asset}/> : ""}</Td>
            <Td>{event.user ? <UserLink user={event.user}/> : ""}</Td>
            <Td>
              {event.accessories && Array.isArray(event.accessories) ? (
                event.accessories.map(({ accessoryType, count }, idx) => (
                  <AccTypeLink key={idx} accType={accessoryType} />
                ))
              ) : (
                ""
              )}
            </Td>
            <Td>{event.tags && <Tags tags={event.tags}/>}</Td>
            <Td>{event.adminName}</Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};

export default EventTable;