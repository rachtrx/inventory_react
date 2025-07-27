import React from 'react';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useColorModeValue
} from '@chakra-ui/react';
import { AccTypeLink, AssetLink, UserLink } from '../buttons/ItemLink';
import { Tags } from '../tags/Tags';
import { useItems } from '../../context/ItemsProvider';
import { TriangleDownIcon, TriangleUpIcon } from '@chakra-ui/icons';
const EventTable = ({ items }) => {

  const { handleSort, sortField, sortOrder } = useItems();

  return (
    <Table variant="simple" size="sm">
      <Thead position="sticky" top="0" zIndex="1" bg={useColorModeValue('gray.100', 'gray.700')}>
        <Tr>
          <Th>Event Type</Th>
          <Th onClick={() => handleSort("eventDate")} cursor="pointer">
            Event Date {sortField === "eventDate" && (sortOrder === "asc" ? <TriangleUpIcon /> : <TriangleDownIcon />)}
          </Th>
          <Th>Asset</Th>
          <Th>User</Th>
          <Th>Accessories</Th>
          <Th>Tag</Th>
          <Th onClick={() => handleSort("admin")} cursor="pointer">
            Admin {sortField === "admin" && (sortOrder === "asc" ? <TriangleUpIcon /> : <TriangleDownIcon />)}
          </Th>
        </Tr>
      </Thead>
      <Tbody>
        {items.map((event, index) => (
          <Tr key={index} bg={event.type}>
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
            <Td>{event.tags && <Tags tags={event.tags} textSize="xs"/>}</Td>
            <Td>{event.adminName}</Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};

export default EventTable;