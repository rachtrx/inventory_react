import { Table, Thead, Tbody, Tr, Th, Td, IconButton, useColorModeValue, VStack, Flex } from '@chakra-ui/react';
import { AiFillStar, AiOutlineStar } from "react-icons/ai";
import { UserActionButton } from '../buttons/actions/UserActionButton';
import { useDrawer } from '../../context/DrawerProvider';
import { FormType, useFormModal } from '../../context/ModalProvider';
import { ItemsList } from './popovers/ItemsList';
import { useResponsive } from '../../context/ResponsiveProvider';
import { ResponsiveText } from '../utils/ResponsiveText';
import { useState } from 'react';
import StarButton from '../buttons/StarButton';
import { useUI } from '../../context/UIProvider';
import { useItems } from '../../context/ItemsProvider';
import { UserLink } from '../buttons/ItemLink';
import Tags from '../tags/Tags';

const UserTable = ({ items }) => {

  const { loading, setLoading, error, setError }  = useUI();
  const { handleUpdate } = useItems()

  return (
    <Table size='sm' variant="simple">
      <Thead position="sticky" top="0" zIndex="1" bg={useColorModeValue('gray.100', 'gray.700')}>
        <Tr>
          <Th></Th>
          <Th>User Name</Th>
          <Th>Department</Th>
          <Th>Assets</Th>
          <Th>Tags</Th>
        </Tr>
      </Thead>
      <Tbody>
        {items.map((user) => (
          <Tr 
            key={user.userId} 
            _hover={{ bg: 'gray.100' }}
          >
            <Td><StarButton id={user.userId} isBookmarked={user.bookmarked} onToggle={handleUpdate}/></Td>
            <Td><UserLink user={user} size={'lg'} fontWeight="bold"/></Td>
            <Td><ResponsiveText>{user.deptName}</ResponsiveText></Td>
            
            <Td>
              {user.loans?.length > 0 && <ItemsList user={user}/>}
            </Td>
            <Td><Tags tags={user.tags}/></Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
}

export default UserTable;