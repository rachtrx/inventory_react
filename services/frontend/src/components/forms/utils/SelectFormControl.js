import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import { withSelect } from './select/withSelect';
import { withSearch } from './select/withSearch';
import { withCreate } from './select/withCreate';

const EnhancedSelect = withSelect(Select);
const EnhancedCreatableSelect = withCreate(withSelect(CreatableSelect));
const SearchSelect = withSearch(withSelect(Select));

// Single Select without Search
export const SingleSelectFormControl = (props) => {
  return (
    <EnhancedSelect 
      {...props}
      isClearable={true}
      isMulti={false}
    />
  );
};

// Multi Select without Search
export const MultiSelectFormControl = (props) => {
  return (
    <EnhancedSelect 
      {...props}
      isMulti={true}
      closeMenuOnSelect={true}
    />
  );
};

// Creatable Single Select without Search
export const CreatableSingleSelectFormControl = (props) => {
  return (
    <EnhancedCreatableSelect 
      {...props}
      isClearable={true}
      isMulti={false}
    />
  );
};

// Creatable Single Select without Search
export const CreatableMultiSelectFormControl = (props) => {
  return (
    <EnhancedCreatableSelect 
      {...props}
      isMulti={true}
      closeMenuOnSelect={true}
    />
  );
};

// Single Select with Search
export const SearchSingleSelectFormControl = (props) => {
  return (
    <SearchSelect 
      {...props}
      isClearable={true}
      isMulti={false}
    />
  );
};
