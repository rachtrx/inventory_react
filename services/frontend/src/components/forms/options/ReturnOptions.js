import { components } from 'react-select';
import { Box, HStack, Icon, VStack } from '@chakra-ui/react';
import { SearchSingleSelectFormControl } from '../utils/SelectFormControl';
import { ResponsiveText } from '../../utils/ResponsiveText';
import { FaUser } from 'react-icons/fa';
import { MdDevices, MdCable } from 'react-icons/md';


const InfoRow = ({ icon, children }) => (
  <HStack align="start" spacing={2}>
    <Box pt={1}><Icon as={icon} boxSize={4} /></Box>
    <ResponsiveText size="sm">{children}</ResponsiveText>
  </HStack>
);

const CustomOption = (props) => {
  const { data, isSelected } = props;
  const { astLoan, user, accLoans } = data;

  return (
    <components.Option {...props}>
      <VStack
        align="start"
        spacing={1}
        fontWeight={isSelected ? 'bold' : 'normal'}
      >
        {astLoan?.asset && (
          <InfoRow icon={MdDevices}>
            {astLoan.asset.serialNumber}
          </InfoRow>
        )}

        {accLoans && accLoans.length > 0 && (
          <InfoRow icon={MdCable}>
            {accLoans.map(accLoan => accLoan.accType.accessoryName).join(', ')}
          </InfoRow>
        )}

        {user && (
          <InfoRow icon={FaUser}>
            {user.userName}
          </InfoRow>
        )}
      </VStack>
    </components.Option>
  );
};


const ReturnAstSelectFormControl = (props) => {
  return (
    <SearchSingleSelectFormControl
      {...props}
      isClearable={true}
      isMulti={false}
      components={{ Option: CustomOption }}
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
