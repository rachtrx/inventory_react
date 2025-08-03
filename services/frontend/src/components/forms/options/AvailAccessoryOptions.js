import { CreatableSingleSelectFormControl } from '../utils/SelectFormControl';
import { components } from 'react-select';
import { Badge, Flex, Text } from '@chakra-ui/react';

const CustomAccOption = (props) => {
  //   console.log(props.data);
  
  const { accessoryName, stock, value } = props.data || {};

  return (
  <components.Option {...props}>
    <Flex direction="column" style={{ fontWeight: props.isSelected ? "bold" : "normal" }}>
      {!accessoryName && value && <Text>Create {value}...</Text>}
      {accessoryName && <Text>{accessoryName}</Text>}
      {!isNaN(stock) && <Badge colorScheme={stock > 0 ? "green" : "red"}>Stock: {stock}</Badge>}
    </Flex>
  </components.Option>
)};

const AvailAccSelectFormControl = (props, children) => {
  return (
    <CreatableSingleSelectFormControl
      {...props}
      isClearable={true}
      isMulti={false}
      components={{ Option: CustomAccOption }}
    />
  );
};

export { AvailAccSelectFormControl };