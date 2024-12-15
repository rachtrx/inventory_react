import UserFilters from "./UserFilters";
import UserActions from './UserActions';
import UserCards from './UserCards';
import UserTable from './UserTable'
import RecordsLayout from '../RecordsLayout';
import { ItemsProvider, useItems } from "../../context/ItemsProvider";
import userService from "../../services/UserService";

export const UsersPage = () => {

  return (
    <ItemsProvider service={userService} idField="userId">
      <RecordsLayout
        header="Users"
        Filters={UserFilters}
        Actions={UserActions}
        Cards={UserCards}
        Table={UserTable}
      />
    </ItemsProvider>
  );
}

