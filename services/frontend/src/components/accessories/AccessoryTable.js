import { Table, Thead, Tbody, Tr, Th, Td, IconButton, useColorModeValue, VStack, Flex } from '@chakra-ui/react';
import { ResponsiveText } from '../utils/ResponsiveText';
import { ItemStarButton } from '../buttons/StarButton';
import { useUI } from '../../context/UIProvider';
import { useItems } from '../../context/ItemsProvider';
import { AccTypeLink } from '../buttons/ItemLink';
import { CircleText } from '../utils/CircleText';
import { useLoading } from '../../context/LoadingProvider';
import { TriangleDownIcon, TriangleUpIcon } from '@chakra-ui/icons';

const AccessoryTable = ({ items }) => {

  const { handleUpdate, handleSort, sortField, sortOrder } = useItems()

  return (
    <Table size='sm' variant="simple">
      <Thead position="sticky" top="0" zIndex="1" bg={useColorModeValue('gray.100', 'gray.700')}>
        <Tr>
          <Th></Th>
          <Th onClick={() => handleSort("accessoryName")} cursor="pointer">
            Accessory Name {sortField === "accessoryName" && (sortOrder === "asc" ? <TriangleUpIcon /> : <TriangleDownIcon />)}
          </Th>
          <Th>Assets</Th>
          <Th>Users</Th>
        </Tr>
      </Thead>
      <Tbody>
        {items.map((accessoryType) => (
          <Tr 
            key={accessoryType.accessoryTypeId} 
            _hover={{ bg: 'gray.100' }}
           >
            <Td><ItemStarButton id={accessoryType.accessoryTypeId} isBookmarked={accessoryType.bookmarked} onToggle={handleUpdate}/></Td>
            <Td><AccTypeLink accType={accessoryType} size={'lg'} fontWeight="bold"/></Td>
            
            <Td>
              <CircleText
                text={accessoryType.assets?.length || 0}
              />
              <ResponsiveText>Assets</ResponsiveText>
            </Td>
            <Td>
              <CircleText
                text={accessoryType.users?.length || 0}
              />
              <ResponsiveText>Users</ResponsiveText>
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
}

export default AccessoryTable;