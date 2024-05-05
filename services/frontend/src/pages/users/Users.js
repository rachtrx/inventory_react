import { loadAllUsers } from '../../redux/actions/users';
import UserFilters from './UserFilters';
import UserCards from './UserCards';
import UserActions from './UserActions';
import DataDisplayComponent from '../DataDisplayComponent';
import { useContext } from 'react';
import { UserContext } from '../../context/UserProvider';

export default function UsersPage() {

  const { assets, loading, error } = useContext(UserContext);

  return (
    <DataDisplayComponent
      dataKey="users"
      data={assets}
      loading={loading}
      error={error}
      Filters={UserFilters}
      Actions={UserActions}
      Cards={UserCards}
    />
  );
}