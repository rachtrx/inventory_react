import { VStack, Flex } from '@chakra-ui/react';
import { Table, Thead, Tbody, Tr, Th, Td } from "@chakra-ui/table";
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
import { useItems } from '../../context/ItemsProvider';
import { ItemLink } from '../buttons/ItemLink';
import { useTheme } from "next-themes";

const UserTable = ({ items }) => {

  const { theme } = useTheme();
  const { loading, setLoading, error, setError }  = useUI();
  const { handleUpdate } = useItems()

  return (
    <Table size='sm' variant="simple">
      <Thead position="sticky" top="0" zIndex="1" bg={theme === "dark" ? "gray.700" : "gray.100"}>
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
            key={user.userId} 
            _hover={{ bg: 'gray.100' }}
            // onClick={() => handleItemClick(user)}
          >
            <Td><StarButton id={user.userId} isBookmarked={user.bookmarked} onToggle={handleUpdate}/></Td>
            <Td><ItemLink item={user} size={'lg'} fontWeight="bold"/></Td>
            <Td><ResponsiveText>{user.department.deptName}</ResponsiveText></Td><Td>
              {user.userLoans?.length > 0 ? 
                <AssetList user={user}/> : 
                <Flex>
                  <ActionButton formType={user.deleteEvent ? formTypes.RESTORE_USER : formTypes.LOAN} item={user} style={{ marginLeft: 'auto' }} />
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