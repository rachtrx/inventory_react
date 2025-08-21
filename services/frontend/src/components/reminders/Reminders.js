import React from 'react';
import ReminderFilters from './ReminderFilters';
import ReminderTable from './ReminderTable';
import { ItemsProvider } from '../../context/ItemsProvider';
import RecordsLayout from '../RecordsLayout';
import ReminderCards from './ReminderCards';
import reminderService from '../../services/ReminderService';
import ReminderActions from './ReminderActions';
import { UpdateExpectedReturn } from './bulkActions/UpdateExpectedReturn';
import { ReturnAll } from './bulkActions/ReturnAll';

export const RemindersPage = () => {

  return (
    <ItemsProvider service={reminderService} initSortField="expectedReturnDate" itemKey="loanId">
      <RecordsLayout
        header="Reminder"
        Filters={ReminderFilters}
        Actions={ReminderActions}
        Cards={ReminderCards}
        BulkActions={[UpdateExpectedReturn, ReturnAll]}
        Table={ReminderTable}
        defaultSearches={[
          { attr: "serialNumber", label: "asset"},
          { attr: "userName", label: "user"}
        ]}
      />
    </ItemsProvider>
  );
}
