// UserTable.jsx
import {
  Th,
  Td,
  Text,
} from '@chakra-ui/react';
import { CircleUserActionButton } from '../buttons/actions/UserActionButton';
import { FormType } from '../../context/FormProvider';
import { UserItemsList } from "../utils/popovers/ItemsList";
import { ItemStarButton } from '../buttons/StarButton';
import { useItems } from '../../context/ItemsProvider';
import { UserLink } from '../buttons/ItemLink';
import { Tags } from '../tags/Tags';
import { TriangleDownIcon, TriangleUpIcon } from '@chakra-ui/icons';
import { SelectableTable } from "../utils/SelectableTable";

const UserTable = () => {
  const { handleUpdate, handleSort, sortField, sortOrder } = useItems();

  return (
    <SelectableTable
      columns={[
        <Th key="star" />,
        <Th key="name" onClick={() => handleSort("userName")} cursor="pointer">
          User Name {sortField === "userName" && (sortOrder === "asc" ? <TriangleUpIcon /> : <TriangleDownIcon />)}
        </Th>,
        <Th key="dept" onClick={() => handleSort("deptName")} cursor="pointer">
          Department {sortField === "deptName" && (sortOrder === "asc" ? <TriangleUpIcon /> : <TriangleDownIcon />)}
        </Th>,
        <Th key="assets">Assets</Th>,
        <Th key="tags">Tags</Th>,
        <Th key="loan">Loan</Th>,
      ]}
      renderRow={(user) => {
        return {
          props: { _hover: { bg: 'bgGray' } },
          cells: [
            <Td key="star">
              <ItemStarButton
                id={user.userId}
                isBookmarked={user.bookmarked}
                onToggle={handleUpdate}
              />
            </Td>,
            <Td key="name">
              <UserLink user={user} size="lg" fontWeight="bold" />
            </Td>,
            <Td key="dept"><Text>{user.deptName}</Text></Td>,
            <Td key="assets">
              {user.loans?.length > 0 && <UserItemsList loans={user.loans} />}
            </Td>,
            <Td key="tags">
              <Tags tags={user.tags} textSize="xs" />
            </Td>,
            <Td key="loan">
              {!user.deleteEvent && (
                <CircleUserActionButton
                  formType={FormType.LOAN}
                  user={user}
                />
              )}
            </Td>
          ]
        };
      }}
    />
  );
};

export default UserTable;
