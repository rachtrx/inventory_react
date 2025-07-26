import { Table, Thead, Tbody, Tr, Th, Td, useColorModeValue, Flex } from '@chakra-ui/react';
import { ResponsiveText } from '../utils/ResponsiveText';
import { ItemStarButton } from '../buttons/StarButton';
import { useItems } from '../../context/ItemsProvider';
import { AccTypeLink } from '../buttons/ItemLink';
import { CircleText } from '../utils/CircleText';
import { TriangleDownIcon, TriangleUpIcon } from '@chakra-ui/icons';
import accessoryService from '../../services/AccessoryService';
import { LoansPopover } from './LoansPopover';
import { AccTypeActionButton, CircleAccTypeActionButton } from '../buttons/actions/AccTypeActionButton';
import { FormType } from '../../context/ModalProvider';

const AccessoryTable = ({ items }) => {

  const { handleSort, sortField, sortOrder } = useItems()

  return (
    <Table size='sm' variant="simple">
      <Thead position="sticky" top="0" zIndex="1" bg={useColorModeValue('gray.100', 'gray.700')}>
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
            _hover={{ bg: 'gray.100' }}
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
              <ResponsiveText>Available</ResponsiveText>
            </Td>
            <Td>
              <CircleText
                text={accessoryType.registeredCount || 0}
              />
              <ResponsiveText>Registered</ResponsiveText>
            </Td>
            <Td>
              <LoansPopover
                accessoryType={accessoryType}
                searchFunc={(id) => accessoryService.getLoanDetails(id)}
                count={accessoryType.loanCount}
              />
              <ResponsiveText>Loaned</ResponsiveText>
            </Td>
            <Td>
              <LoansPopover
                accessoryType={accessoryType}
                searchFunc={(id) => accessoryService.getReservationDetails(id)}
                count={accessoryType.reserveCount}
              />
              <ResponsiveText>Reserved</ResponsiveText>
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
}

export default AccessoryTable;