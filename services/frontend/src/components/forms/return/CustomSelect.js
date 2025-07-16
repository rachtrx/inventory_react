import React from 'react';
import Select, { components } from 'react-select';
import { Box, Flex, Icon, Text } from '@chakra-ui/react';
import { FaChevronDown } from 'react-icons/fa';
import { SearchSingleSelectFormControl } from '../utils/SelectFormControl';
import { ResponsiveText } from '../../utils/ResponsiveText';

const CustomOption = (props) => {
  // console.log(props.data);
  return (
  <components.Option {...props}>
      <Flex direction="column" style={{ fontWeight: props.isSelected ? "bold" : "normal" }}>
          {props.data.astLoan?.asset && <ResponsiveText>{props.data.astLoan.asset.serialNumber}</ResponsiveText>}
          {
            props.data.user &&
            <ResponsiveText>{props.data.user.userName}</ResponsiveText>
          }
          {
            props.data.accLoans &&
            <ResponsiveText>{props.data.accLoans.map(accLoan => accLoan.accType.accessoryName).join(", ")}</ResponsiveText>
          }
      </Flex>
  </components.Option>
)};

const CustomSingleValue = (props) => (
  <components.SingleValue {...props}>
      🌟 {props.data.label}
  </components.SingleValue>
);

// Custom Control Component
// const CustomControl = ({ children, ...props }) => {
//   return (
//     <components.Control {...props}>
//       <Flex
//         alignItems="center"
//         border="2px solid"
//         borderColor="blue.400"
//         borderRadius="md"
//         p="2"
//         bg="gray.50"
//         w="100%"
//         _hover={{ borderColor: "blue.500" }}
//       >
//         {children}
//       </Flex>
//     </components.Control>
//   );
// };

const ReturnAstSelectFormControl = (props) => {
  return (
    <SearchSingleSelectFormControl
      {...props}
      isClearable={true}
      isMulti={false}
      components={{ Option: CustomOption }}
      // styles={{
      //   menu: (provided) => ({
      //     ...provided,
      //     border: '1px solid #ccc',
      //     borderRadius: 'md',
      //     overflow: 'hidden',
      //   }),
      // }}
    />
  );
};

const ReturnUsrSelectFormControl = (props) => {
	return (
		<SearchSingleSelectFormControl
			{...props}
			isClearable={true}
			isMulti={false}
			components={{ Option: CustomOption }}
		/>
	);
};

const ReturnAccSelectFormControl = (props) => {
	return (
		<SearchSingleSelectFormControl
			{...props}
			isClearable={true}
			isMulti={false}
			components={{ Option: CustomOption }}
		/>
	);
};

export { ReturnAstSelectFormControl, ReturnUsrSelectFormControl, ReturnAccSelectFormControl };
