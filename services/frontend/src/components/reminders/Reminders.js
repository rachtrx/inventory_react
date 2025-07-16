import React from 'react';
import ReminderFilters from './ReminderFilters';
import ReminderTable from './ReminderTable';
import { ItemsProvider } from '../../context/ItemsProvider';
import RecordsLayout from '../RecordsLayout';
import ReminderCards from './ReminderCards';
import reminderService from '../../services/ReminderService';
import ReminderActions from './ReminderActions';

export const RemindersPage = () => {

  return (
    <ItemsProvider service={reminderService} initSortField="expectedReturnDate">
      <RecordsLayout
        header="Reminders"
        Filters={ReminderFilters}
        Actions={ReminderActions}
        Cards={ReminderCards}
        Table={ReminderTable}
        defaultSearches={[
          { attr: "serialNumber", label: "asset"},
          { attr: "userName", label: "user"}
        ]}
      />
    </ItemsProvider>
  );
}
