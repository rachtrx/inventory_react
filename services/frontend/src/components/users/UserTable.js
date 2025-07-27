import { Table, Thead, Tbody, Tr, Th, Td, useColorModeValue, Text } from '@chakra-ui/react';
import { CircleUserActionButton } from '../buttons/actions/UserActionButton';
import { FormType } from '../../context/ModalProvider';
import { UserItemsList } from "../utils/popovers/ItemsList";
import { ItemStarButton } from '../buttons/StarButton';
import { useItems } from '../../context/ItemsProvider';
import { UserLink } from '../buttons/ItemLink';
import { Tags } from '../tags/Tags';
import { TriangleDownIcon, TriangleUpIcon } from '@chakra-ui/icons';

const UserTable = ({ items }) => {

  const { handleUpdate, handleSort, sortField, sortOrder } = useItems()

  return (
    <Table size='sm' variant="simple">
      <Thead position="sticky" top="0" zIndex="1" bg={useColorModeValue('gray.100', 'gray.700')}>
        <Tr>
          <Th></Th>
          <Th onClick={() => handleSort("userName")} cursor="pointer">
            User Name {sortField === "userName" && (sortOrder === "asc" ? <TriangleUpIcon /> : <TriangleDownIcon />)}
          </Th>
          <Th onClick={() => handleSort("deptName")} cursor="pointer">
            Department {sortField === "deptName" && (sortOrder === "asc" ? <TriangleUpIcon /> : <TriangleDownIcon />)}
          </Th>
          <Th>Assets</Th>
          <Th>Tags</Th>
          <Th>Loan</Th>
        </Tr>
      </Thead>
      <Tbody>
        {items.map((user) => (
          <Tr 
            key={user.userId} 
            _hover={{ bg: 'gray.100' }}
          >
            <Td><ItemStarButton id={user.userId} isBookmarked={user.bookmarked} onToggle={handleUpdate}/></Td>
            <Td><UserLink user={user} size={'lg'} fontWeight="bold"/></Td>
            <Td><Text>{user.deptName}</Text></Td>
            
            <Td>
              {user.loans?.length > 0 && <UserItemsList loans={user.loans}/>}
            </Td>
            <Td><Tags tags={user.tags} textSize="xs"/></Td>
            <Td>
              {!user.deleteEvent && 
                <CircleUserActionButton 
                  formType={FormType.LOAN} // TODO FormType.RESTORE_USER
                  user={user}
                />
              }
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
}

export default UserTable;