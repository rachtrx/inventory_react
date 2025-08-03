// EventTable.jsx
import React from 'react';
import {
  Th,
  Td,
  Flex,
  Text,
} from '@chakra-ui/react';
import { AccTypeLink, AssetLink, UserLink } from '../buttons/ItemLink';
import { Tags } from '../tags/Tags';
import { useItems } from '../../context/ItemsProvider';
import { TriangleDownIcon, TriangleUpIcon } from '@chakra-ui/icons';
import { SelectableTable } from '../utils/SelectableTable';
import RemarksPopover from '../timeline/utils/RemarksPopover';
import { formStyleMap } from '../forms/control/helpers';

const EventTable = () => {
  const { handleSort, sortField, sortOrder } = useItems();

  return (
    <SelectableTable
      columns={[
        <Th key="type">Event Type</Th>,
        <Th key="eventDate" onClick={() => handleSort("eventDate")} cursor="pointer">
          Event Date {sortField === "eventDate" && (sortOrder === "asc" ? <TriangleUpIcon /> : <TriangleDownIcon />)}
        </Th>,
        <Th key="asset">Asset</Th>,
        <Th key="user">User</Th>,
        <Th key="accessories">Accessories</Th>,
        <Th key="tags">Tag</Th>,
        <Th key="admin" onClick={() => handleSort("admin")} cursor="pointer">
          Admin {sortField === "admin" && (sortOrder === "asc" ? <TriangleUpIcon /> : <TriangleDownIcon />)}
        </Th>,
      ]}
      renderRow={(event) => {
        return {
          props: { ...formStyleMap[event.type] },
          cells: [
            <Td key="type">
              <Flex gap={1} alignItems="center">
                <Text fontSize="sm">{event.type}</Text>
                <RemarksPopover 
                  remarks={event.remarks}
                  eventId={event.eventId}
                />
              </Flex>
            </Td>,
            <Td key="eventDate">{event.eventDate}</Td>,
            <Td key="asset">{event.asset ? <AssetLink asset={event.asset} withTooltip={true}/> : ""}</Td>,
            <Td key="user">{event.user ? <UserLink user={event.user} withTooltip={true}/> : ""}</Td>,
            <Td key="accessories">
              {event.accessories && Array.isArray(event.accessories) ? (
                event.accessories.map(({ accessoryType }, idx) => (
                  <AccTypeLink key={idx} accType={accessoryType} />
                ))
              ) : (
                ""
              )}
            </Td>,
            <Td key="tags">
              {event.tags && <Tags tags={event.tags} textSize="xs" />}
            </Td>,
            <Td key="admin">{event.adminName}</Td>
          ]
        };
      }}
    />
  );
};

export default EventTable;
