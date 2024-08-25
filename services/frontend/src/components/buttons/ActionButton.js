import { Box, Button } from '@chakra-ui/react';
import { buttonConfigs } from './constants';
import { actionTypes, useFormModal } from '../../context/ModalProvider';
import { ResponsiveText } from '../utils/ResponsiveText';

const ActionButton = ({ formType, borderRadius="md", item = null }) => {
	const { bg, text } = buttonConfigs[formType];
	const { setFormType } = useFormModal();

	return (
		<Box
			as="button"
			onClick={(e) => {
				setFormType(formType)
			}}
			bg={bg}
			borderRadius={borderRadius}
			p={2}
			_hover={{
				bg: `${bg.split('.')[0]}.200`,
				cursor: 'pointer',
			}}
			_active={{ bg: `${bg.split('.')[0]}.250` }}
		>
			<ResponsiveText>{text}{Array.isArray(item) && ' All'}</ResponsiveText>
		</Box>
	);
};
export default ActionButton;