import { Table, Thead, Tbody, Tr, Th, Td, IconButton, useColorModeValue, VStack, Flex } from '@chakra-ui/react';
import { AiFillStar, AiOutlineStar } from "react-icons/ai";
import ActionButton from '../buttons/ActionButton';
import { useDrawer } from '../../context/DrawerProvider';
import { useFormModal } from '../../context/ModalProvider';
import { SplitButton, UserActionButton } from '../buttons/SplitButton';
import { useResponsive } from '../../context/ResponsiveProvider';
import { ResponsiveText } from '../utils/ResponsiveText';
import { useState } from 'react';
import StarButton from '../buttons/StarButton';
import userService from '../../services/UserService';
import { useUI } from '../../context/UIProvider';
import { useGlobal } from '../../context/GlobalProvider';

const UserTable = ({ items }) => {

  const { handleItemClick } = useDrawer()
  const [ hoveredUserId, setHoveredUserId ] = useState(null);
  const { loading, setLoading, error, setError }  = useUI();
  const { handleUserToggle } = useGlobal()

  return (
    <Table variant="simple">
      <Thead position="sticky" top="0" zIndex="1" bg={useColorModeValue('gray.100', 'gray.700')}>
        <Tr>
          <Th>User Name</Th>
          <Th>Department</Th>
          <Th>Assets</Th>
        </Tr>
      </Thead>
      <Tbody>
        {items.map((user) => (
          <Tr 
            key={user.id} 
            _hover={{
              bg: hoveredUserId === user.id ? 'gray.50' : 'gray.100',
              cursor: 'pointer',
            }}
            _active={{ bg: hoveredUserId === user.id ? 'gray.50' : 'gray.200', }}
            onClick={() => handleItemClick(user)}
          >
            <Td>
              <ResponsiveText fontWeight="bold" isTruncated>
                <StarButton id={user.id} isBookmarked={user.bookmarked} onToggle={handleUserToggle}/>
                {user.name}
              </ResponsiveText>
            </Td>
            <Td><ResponsiveText>{user.department}</ResponsiveText></Td>
            <Td>
              <UserActionButton user={user} setHoveredUserId={setHoveredUserId}/>
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
}

export default UserTable;