import { Table, Thead, Tbody, Tr, Th, Td, IconButton, Button, Flex } from '@chakra-ui/react';
import { useDrawer } from '../../context/DrawerProvider';
import { useItems } from '../../context/ItemsProvider';
import StarButton from '../buttons/StarButton';
import { ResponsiveText } from '../utils/ResponsiveText';
import { useState } from 'react';
import { AssetLink, UserLink } from '../buttons/ItemLink';
import { CardActions } from './CardActions';

const AssetTable = ({ items }) => {

  const { handleUpdate } = useItems()

  return (
    <Table size="sm" variant="simple">
      <Thead position="sticky" top="0" zIndex="1" bg="gray.200">
        <Tr>
          <Th></Th>
          <Th>Device Type</Th>
          <Th>Model</Th>
          <Th>Asset Tag</Th>
          <Th>Options</Th>
          <Th>Users</Th>
        </Tr>
      </Thead>
      <Tbody>
        {items.map((asset) => (
          <Tr 
            key={asset.assetId}
            _hover={{ bg: 'gray.100' }}
          >
            <Td>
              <StarButton
                id={asset.assetId}
                isBookmarked={asset.bookmarked}
                onToggle={handleUpdate}
              />
            </Td>
            <Td><ResponsiveText>{asset.typeName}</ResponsiveText></Td>
            <Td><ResponsiveText>{asset.subTypeName}</ResponsiveText></Td>
            <Td><AssetLink item={asset} fontWeight="bold"/></Td>
            <Td>
              <CardActions asset={asset}/>
            </Td>
            <Td>{asset.ongoingLoan && asset.ongoingLoan.loan.userLoans.map((userLoan) => (
              <UserLink item={userLoan.user} fontWeight="bold"/>
            ))}</Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};

export default AssetTable;
