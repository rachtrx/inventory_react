import { Table, Thead, Tbody, Tr, Th, Td, useColorModeValue, Flex, Text } from '@chakra-ui/react';
import { useItems } from '../../context/ItemsProvider';
import { AccTypeLink } from '../buttons/ItemLink';
import { CircleText } from '../utils/CircleText';
import { TriangleDownIcon, TriangleUpIcon } from '@chakra-ui/icons';
import accessoryService from '../../services/AccessoryService';
import { LoansPopover } from './LoansPopover';
import { CircleAccTypeActionButton } from '../buttons/actions/AccTypeActionButton';
import { FormType } from '../../context/ModalProvider';

const AccessoryTable = ({ items }) => {

  const { handleSort, sortField, sortOrder } = useItems()

  return (
    <Table size='sm' variant="simple">
      <Thead position="sticky" top="0" zIndex="1" bg='gray'>
        <Tr>
          {/* <Th></Th> */}
          <Th onClick={() => handleSort("accessoryName")} cursor="pointer">
            Accessory Name {sortField === "accessoryName" && (sortOrder === "asc" ? <TriangleUpIcon /> : <TriangleDownIcon />)}
          </Th>
          <Th>Available</Th>
          <Th>Registered</Th>
          <Th>Loaned</Th>
          <Th>Reserved</Th>
        </Tr>
      </Thead>
      <Tbody>
        {items.map((accessoryType) => (
          <Tr 
            key={accessoryType.accessoryTypeId} 
            _hover={{ bg: 'gray' }}
           >
            {/* <Td><ItemStarButton id={accessoryType.accessoryTypeId} isBookmarked={accessoryType.bookmarked} onToggle={handleUpdate}/></Td> */}
            <Td>
              <Flex gap={1}>
                <AccTypeLink accType={accessoryType} size={'lg'} fontWeight="bold"/>
                <CircleAccTypeActionButton size="sm" formType={FormType.UPDATE_ACC} accTypeIds={accessoryType.accessoryTypeId}/>
              </Flex>
            </Td>
            
            <Td>
              <CircleText
                text={accessoryType.stock || 0}
              />
              <Text>Available</Text>
            </Td>
            <Td>
              <CircleText
                text={accessoryType.registeredCount || 0}
              />
              <Text>Registered</Text>
            </Td>
            <Td>
              <LoansPopover
                accessoryType={accessoryType}
                searchFunc={(id) => accessoryService.getLoanDetails(id)}
                count={accessoryType.loanCount}
              />
              <Text>Loaned</Text>
            </Td>
            <Td>
              <LoansPopover
                accessoryType={accessoryType}
                searchFunc={(id) => accessoryService.getReservationDetails(id)}
                count={accessoryType.reserveCount}
              />
              <Text>Reserved</Text>
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
}

export default AccessoryTable;