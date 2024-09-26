import { Table, Thead, Tbody, Tr, Th, Td, IconButton, useColorModeValue, VStack, Flex } from '@chakra-ui/react';
import { ResponsiveText } from '../utils/ResponsiveText';
import StarButton from '../buttons/StarButton';
import { useUI } from '../../context/UIProvider';
import { useItems } from '../../context/ItemsProvider';
import { ItemLink } from '../buttons/ItemLink';
import { CircleText } from '../utils/CircleText';

const PeripheralTable = ({ items }) => {

  const { loading, setLoading, error, setError }  = useUI();
  const { handleUpdate } = useItems()

  return (
    <Table size='sm' variant="simple">
      <Thead position="sticky" top="0" zIndex="1" bg={useColorModeValue('gray.100', 'gray.700')}>
        <Tr>
          <Th></Th>
          <Th>Name</Th>
          <Th>Assets</Th>
          <Th>Users</Th>
        </Tr>
      </Thead>
      <Tbody>
        {items.map((peripheralType) => (
          <Tr 
            key={peripheralType.id} 
            _hover={{ bg: 'gray.100' }}
            // onClick={() => handleItemClick(peripheralType)}
          >
            <Td><StarButton id={peripheralType.id} isBookmarked={peripheralType.bookmarked} onToggle={handleUpdate}/></Td>
            <Td><ItemLink item={peripheralType} size={'lg'} fontWeight="bold"/></Td>
            
            <Td>
              <CircleText
                text={peripheralType.peripherals?.assets?.length || 0}
              />
              <ResponsiveText>Assets</ResponsiveText>
            </Td>
            <Td>
              <CircleText
                text={peripheralType.peripherals?.users?.length || 0}
              />
              <ResponsiveText>Users</ResponsiveText>
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
}

export default PeripheralTable;