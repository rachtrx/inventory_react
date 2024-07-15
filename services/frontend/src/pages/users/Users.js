import UserFilters from './UserFilters';
import UserCards from './UserCards';
import UserActions from './UserActions';
import RecordsLayout from '../../components/RecordsLayout';
import { UserProvider, useUser } from '../../context/UserProvider';

function UsersContent() {

  const { users, loading, error } = useUser();

  return (
    <RecordsLayout
      dataKey="users"
      data={users}
      loading={loading}
      error={error}
      Filters={UserFilters}
      Actions={UserActions}
      Cards={UserCards}
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

