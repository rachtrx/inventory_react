import { Table, Thead, Tbody, Tr, Th, Td, IconButton, Button, Flex } from '@chakra-ui/react';
import { eventToStatus } from '../../config';
import { useDrawer } from '../../context/DrawerProvider';
import { useGlobal } from '../../context/GlobalProvider';
import StarButton from '../buttons/StarButton';
import { ResponsiveText } from '../utils/ResponsiveText';
import { AssetActionButton, SplitButton } from '../users/AssetList';
import { useState } from 'react';
import ActionButton from '../buttons/ActionButton';
import { formTypes } from '../../context/ModalProvider';
import { ItemLink } from '../buttons/ItemLink';

const AssetTable = ({ items }) => {

  const { handleAssetToggle } = useGlobal()

  return (
    <Table size="sm" variant="simple">
      <Thead position="sticky" top="0" zIndex="1" bg="gray.200">
        <Tr>
          <Th></Th>
          <Th>Device Type</Th>
          <Th>Model</Th>
          <Th>Asset Tag</Th>
          <Th>Options</Th>
          <Th>User</Th>
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
                onToggle={handleAssetToggle}
              />
            </Td>
            <Td><ResponsiveText>{asset.assetType}</ResponsiveText></Td>
            <Td><ResponsiveText>{asset.variant}</ResponsiveText></Td>
            <Td><ItemLink item={asset} fontWeight="bold"/></Td>
            <Td>
              <ActionButton formType={asset.user ? formTypes.RETURN : asset.deletedDate ? formTypes.RESTORE_ASSET : formTypes.LOAN} item={asset} />
            </Td>
            <Td>{asset.user && <ItemLink item={asset.user}/>}</Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};

export default AssetTable;
