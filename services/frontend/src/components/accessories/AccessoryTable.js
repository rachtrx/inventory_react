import { IconButton, VStack, Flex } from '@chakra-ui/react';
import { Table, Thead, Tbody, Tr, Th, Td } from "@chakra-ui/table";
import { ResponsiveText } from '../utils/ResponsiveText';
import StarButton from '../buttons/StarButton';
import { useUI } from '../../context/UIProvider';
import { useItems } from '../../context/ItemsProvider';
import { ItemLink } from '../buttons/ItemLink';
import { CircleText } from '../utils/CircleText';
import { useTheme } from "next-themes";

const AccessoryTable = ({ items }) => {

  const { theme } = useTheme();
  const { loading, setLoading, error, setError }  = useUI();
  const { handleUpdate } = useItems()

  return (
    <Table size='sm' variant="simple">
      <Thead position="sticky" top="0" zIndex="1" bg={theme === "dark" ? "gray.700" : "gray.100"}>
        <Tr>
          <Th></Th>
          <Th>Name</Th>
          <Th>Assets</Th>
          <Th>Users</Th>
        </Tr>
      </Thead>
      <Tbody>
        {items.map((accessoryType) => (
          <Tr 
            key={accessoryType.accessoryTypeId} 
            _hover={{ bg: 'gray.100' }}
            // onClick={() => handleItemClick(peripheralType)}
          >
            <Td><StarButton id={accessoryType.accessoryTypeId} isBookmarked={accessoryType.bookmarked} onToggle={handleUpdate}/></Td>
            <Td><ItemLink item={accessoryType} size={'lg'} fontWeight="bold"/></Td>
            
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