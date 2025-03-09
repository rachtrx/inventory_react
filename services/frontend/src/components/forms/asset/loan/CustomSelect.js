import React from 'react';
import Select, { components } from 'react-select';
import { Box, Flex, Icon, Text } from '@chakra-ui/react';
import { FaChevronDown } from 'react-icons/fa';
import { SearchCreatableSingleSelectFormControl, SearchSingleSelectFormControl } from '../../utils/SelectFormControl';
import { ResponsiveText } from '../../../utils/ResponsiveText';

const CustomOption = (props) => {
//   console.log(props.data);

  const { serialNumber, alias=null, ongoingLoan=null, ongoingReservation=null } = props.data || {};

  return (
  <components.Option {...props}>
      <Flex direction="column" style={{ fontWeight: props.isSelected ? "bold" : "normal" }}>
        <ResponsiveText>{serialNumber}</ResponsiveText>
        {alias && <ResponsiveText>{alias}</ResponsiveText>}
        {
            ongoingLoan && (
                <>
                    <ResponsiveText>On Loan</ResponsiveText>
                    <ResponsiveText>{ongoingLoan.user.userName}</ResponsiveText>
                    {ongoingLoan?.accLoans?.length > 0 && 
                        <ResponsiveText>{ongoingLoan.accLoans.map(accLoan => accLoan.accType.accessoryName).join(", ")}</ResponsiveText>}
                </>
            )
        }
        {
            ongoingReservation && (
                <>
                    <ResponsiveText>Reserved</ResponsiveText>
                    <ResponsiveText>{ongoingReservation.user.userName}</ResponsiveText>
                    {ongoingReservation?.accLoans?.length > 0 && 
                        <ResponsiveText>{ongoingReservation.accLoans.map(accLoan => accLoan.accType.accessoryName).join(", ")}</ResponsiveText>}
                </>
            )
        }
      </Flex>
  </components.Option>
)};

const CustomAccOption = (props) => {
  //   console.log(props.data);
  
    const { accessoryName, stock, value } = props.data || {};
  
    return (
    <components.Option {...props}>
      <Flex direction="column" style={{ fontWeight: props.isSelected ? "bold" : "normal" }}>
        {!accessoryName && value && <ResponsiveText>Create {value}...</ResponsiveText>}
        {accessoryName && <ResponsiveText>{accessoryName}</ResponsiveText>}
        {stock && <ResponsiveText>{stock}</ResponsiveText>}
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

const LoanAstSelectFormControl = (props) => {
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

const LoanAccSelectFormControl = (props) => {
  return (
    <SearchCreatableSingleSelectFormControl
      {...props}
      isClearable={true}
      isMulti={false}
      components={{ Option: CustomAccOption }}
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

export { LoanAstSelectFormControl, LoanAccSelectFormControl };
