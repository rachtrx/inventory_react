import UserFilters from "./UserFilters";
import UserActions from './UserActions';
import UserCards from './UserCards';
import UserTable from './UserTable'
import RecordsLayout from '../RecordsLayout';
import { useGlobal } from "../../context/GlobalProvider";

export const UsersPage = () => {

  const { users, loading, error } = useGlobal();

  return (
    <RecordsLayout
      header="Users"
      data={users}
      loading={loading}
      error={error}
      Filters={UserFilters}
      Actions={UserActions}
      Cards={UserCards}
      Table={UserTable}
    />
  );
}

