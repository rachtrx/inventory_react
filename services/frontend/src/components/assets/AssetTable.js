import { Table, Thead, Tbody, Tr, Th, Td, IconButton, Button, Flex } from '@chakra-ui/react';
import { eventToStatus } from '../../config';
import { useDrawer } from '../../context/DrawerProvider';
import { useGlobal } from '../../context/GlobalProvider';
import StarToggle from '../utils/StarToggle';
import { ResponsiveText } from '../utils/ResponsiveText';
import { SplitReturnButton } from '../buttons/SplitReturnButton';
import { useState } from 'react';

const AssetTable = ({ items }) => {

	const { handleItemClick } = useDrawer()
  const [ hoveredAssetId, setHoveredAssetId ] = useState(null);
  const { handleAssetToggle } = useGlobal()

  return (
    <Table variant="simple">
      <Thead position="sticky" top="0" zIndex="1" bg="gray.200">
        <Tr>
          <Th>Asset Tag</Th>
          <Th>Serial Number</Th>
          <Th>Model</Th>
          <Th>Status</Th>
          <Th>User</Th>
        </Tr>
      </Thead>
      <Tbody>
        {items.map((asset) => (
          <Tr 
            key={asset.id}
            _hover={{
              bg: hoveredAssetId === asset.id ? 'blue.50' : 'blue.100',
              cursor: 'pointer',
            }}
            _active={{ bg: hoveredAssetId === asset.id ? 'blue.50' : 'blue.200', }}
            onClick={() => handleItemClick(asset)}
          >
            <Td>
              <ResponsiveText>
                <StarToggle
                  position="absolute" top={2} right={2}
                  id={asset.id}
                  isBookmarked={asset.bookmarked}
                  onToggle={handleAssetToggle}
                />
                {asset.assetTag}
              </ResponsiveText>
            </Td>
            <Td><ResponsiveText>{asset.serialNumber}</ResponsiveText></Td>
            <Td><ResponsiveText>{asset.variant}</ResponsiveText></Td>
            <Td>
              {eventToStatus(asset.status)}
            </Td>
            <Td>
              {asset.user && (
								<Flex key={asset.id} gap={2}>
                  <SplitReturnButton
                    item={asset.user}
                    onMouseEnterFn={() => setHoveredAssetId(asset.id)}
                    onMouseLeaveFn={() => setHoveredAssetId(null)}
                  />
              </Flex>
              )}
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};

export default AssetTable;
