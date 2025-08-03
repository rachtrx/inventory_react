import UserFilters from "./UserFilters";
import UserActions from './UserActions';
import UserCards from './UserCards';
import UserTable from './UserTable'
import RecordsLayout from '../RecordsLayout';
import { ItemsProvider } from "../../context/ItemsProvider";
import userService from "../../services/UserService";
import { useMemo } from "react";
import { LoanAll } from "./bulkActions/LoanAll";
import { ReturnAll } from "./bulkActions/ReturnAll";
import { TagAll } from "./bulkActions/TagAll";
import { UntagAll } from "./bulkActions/UntagAll";
import { UserTagsFormProvider } from "../forms/user/tags/UserTagsProvider";

export const UsersPage = () => {

  const bulkActions = useMemo(() => [
      () => (
        <>
          <LoanAll/>
          <ReturnAll/>
          <UserTagsFormProvider>
            <TagAll />
            <UntagAll/>
          </UserTagsFormProvider>
        </>
      )
    ], []);

  return (
    <ItemsProvider service={userService} itemKey="userId" initSortField="userName">
      <RecordsLayout
        header="Users"
        Filters={UserFilters}
        Actions={UserActions}
        Cards={UserCards}
        Table={UserTable}
        BulkActions={bulkActions}
        defaultSearches={[{ attr: "userName", label: "user"}]}
      />
    </ItemsProvider>
  );
}

