import { Table, Thead, Tbody, Tr, Th, Td, IconButton, Button, Flex } from '@chakra-ui/react';
import { useDrawer } from '../../context/DrawerProvider';
import { useItems } from '../../context/ItemsProvider';
import StarButton from '../buttons/StarButton';
import { ResponsiveText } from '../utils/ResponsiveText';
import { AssetActionButton, SplitButton } from '../users/AssetList';
import { useState } from 'react';
import ActionButton from '../buttons/ActionButton';
import { formTypes } from '../../context/ModalProvider';
import { ItemLink } from '../buttons/ItemLink';
import { CardActions } from './CardActions';

const AssetTable = ({ items }) => {

  const { handleToggle } = useItems()

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
            key={asset.id}
            _hover={{ bg: 'gray.100' }}
            // onClick={() => handleItemClick(asset)}
          >
            <Td>
              <StarButton
                id={asset.id}
                isBookmarked={asset.bookmarked}
                onToggle={handleToggle}
              />
            </Td>
            <Td><ResponsiveText>{asset.assetType}</ResponsiveText></Td>
            <Td><ResponsiveText>{asset.variant}</ResponsiveText></Td>
            <Td><ItemLink item={asset} fontWeight="bold"/></Td>
            <Td>
              <CardActions asset={asset}/>
            </Td>
            <Td>{asset.users && asset.users.map((user) => (<ItemLink item={user} fontWeight="bold"/>))}</Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};

export default AssetTable;
