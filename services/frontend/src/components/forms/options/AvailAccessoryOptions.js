import { SearchCreatableSingleSelectFormControl } from '../utils/SelectFormControl';
import { components } from 'react-select';
import { Badge, Flex } from '@chakra-ui/react';
import { ResponsiveText } from '../../utils/ResponsiveText';

const CustomAccOption = (props) => {
  //   console.log(props.data);
  
    const { accessoryName, stock, value } = props.data || {};
  
    return (
    <components.Option {...props}>
      <Flex direction="column" style={{ fontWeight: props.isSelected ? "bold" : "normal" }}>
        {!accessoryName && value && <ResponsiveText>Create {value}...</ResponsiveText>}
        {accessoryName && <ResponsiveText>{accessoryName}</ResponsiveText>}
        {stock && <Badge colorScheme={stock > 0 ? "green" : "red"}>Stock: {stock}</Badge>}
      </Flex>
    </components.Option>
  )};

const AvailAccSelectFormControl = (props) => {
  return (
    <SearchCreatableSingleSelectFormControl
      {...props}
      isClearable={true}
      isMulti={false}
      components={{ Option: CustomAccOption }}
    />
  );
};

export { AvailAccSelectFormControl };