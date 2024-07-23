import { Table, Thead, Tbody, Tr, Th, Td, IconButton, useColorModeValue, VStack, Flex } from '@chakra-ui/react';
import { AiFillStar, AiOutlineStar } from "react-icons/ai";
import ActionButton from '../buttons/ActionButton';
import { useDrawer } from '../../context/DrawerProvider';
import { formTypes, useFormModal } from '../../context/ModalProvider';
import { AssetList } from './AssetList';
import { useResponsive } from '../../context/ResponsiveProvider';
import { ResponsiveText } from '../utils/ResponsiveText';
import { useState } from 'react';
import StarButton from '../buttons/StarButton';
import { useUI } from '../../context/UIProvider';
import { useGlobal } from '../../context/GlobalProvider';
import { ItemLink } from '../buttons/ItemLink';

const UserTable = ({ items }) => {

  const { loading, setLoading, error, setError }  = useUI();
  const { handleUserToggle } = useGlobal()

  return (
    <Table size='sm' variant="simple">
      <Thead position="sticky" top="0" zIndex="1" bg={useColorModeValue('gray.100', 'gray.700')}>
        <Tr>
          <Th></Th>
          <Th>User Name</Th>
          <Th>Department</Th>
          <Th>Assets</Th>
        </Tr>
      </Thead>
      <Tbody>
        {items.map((user) => (
          <Tr 
            key={user.id} 
            _hover={{ bg: 'gray.100' }}
            // onClick={() => handleItemClick(user)}
          >
            <Td><StarButton id={user.id} isBookmarked={user.bookmarked} onToggle={handleUserToggle}/></Td>
            <Td><ItemLink item={user} size={'lg'} fontWeight="bold"/></Td>
            <Td><ResponsiveText>{user.department}</ResponsiveText></Td><Td>
              {user.assets?.length > 0 ? 
                <AssetList user={user}/> : 
                <Flex>
                  <ActionButton formType={user.deletedDate ? formTypes.RESTORE_USER : formTypes.LOAN} item={user} style={{ marginLeft: 'auto' }} />
                </Flex>
              }
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
}

export default UserTable;