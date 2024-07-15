import UserFilters from "./UserFilters";
import UserActions from './UserActions';
import UserCards from './UserCards';
import UserTable from './UserTable'
import RecordsLayout from '../RecordsLayout';
import { UserProvider, useUser } from "../../context/UserProvider";

function UsersContent() {

  const { users, loading, error } = useUser();

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

export default function UsersPage() {
  return (
    <UserProvider>
      <UsersContent />
    </UserProvider>
  );
}

