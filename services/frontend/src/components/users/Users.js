import UserFilters from "./UserFilters";
import UserActions from './UserActions';
import UserCards from './UserCards';
import UserTable from './UserTable'
import RecordsLayout from '../RecordsLayout';
import { ItemsProvider } from "../../context/ItemsProvider";
import userService from "../../services/UserService";
import SearchBar from "../utils/SearchBar";

export const UsersPage = () => {

  return (
    <ItemsProvider service={userService} idField="userId" initSortField="userName">
      <RecordsLayout
        header="Users"
        Filters={UserFilters}
        Actions={UserActions}
        Cards={UserCards}
        Table={UserTable}
        defaultSearches={[{ attr: "userName", label: "user"}]}
      />
    </ItemsProvider>
  );
}

