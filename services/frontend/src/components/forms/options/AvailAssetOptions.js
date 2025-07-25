import { components } from 'react-select';
import { Badge, Flex } from '@chakra-ui/react';
import { SearchSingleSelectFormControl } from '../utils/SelectFormControl';
import { ResponsiveText } from '../../utils/ResponsiveText';

const CustomOption = (props) => {
  console.log(props.data);

  const { serialNumber, alias=null, loan=null, reservation=null, delEventId=null } = props.data || {};

  return (
  <components.Option {...props}>
      <Flex direction="column" style={{ fontWeight: props.isSelected ? "bold" : "normal" }}>
        {
            loan && (
                <>
                    <Badge colorScheme='red'>On Loan  - {loan.user.userName}</Badge>
                    {loan?.accLoans?.length > 0 && 
                        <ResponsiveText>{loan.accLoans.map(accLoan => accLoan.accType.accessoryName).join(", ")}</ResponsiveText>}
                </>
            )
        }
        {
            reservation && (
                <>
                    <Badge colorScheme='orange'>Reserved - {reservation.user.userName}</Badge>
                    {reservation?.accLoans?.length > 0 && 
                        <ResponsiveText>{reservation.accLoans.map(accLoan => accLoan.accType.accessoryName).join(", ")}</ResponsiveText>}
                </>
            )
        }
        {delEventId && <Badge colorScheme='red'>Condemned</Badge>}
        <ResponsiveText>{`${serialNumber}${alias ? ` (${alias})` : ''}`}</ResponsiveText>
      </Flex>
  </components.Option>
)};

const AvailAstSelectFormControl = (props) => {
  return (
    <SearchSingleSelectFormControl
      {...props}
      isClearable={true}
      isMulti={false}
      components={{ Option: CustomOption }}
    />
  );
};

export { AvailAstSelectFormControl };
