import { Box, Button } from '@chakra-ui/react';
import { buttonConfigs } from './constants';
import { actionTypes, useFormModal } from '../../context/ModalProvider';
import { ResponsiveText } from '../utils/ResponsiveText';

const ActionButton = ({ formType, item = null }) => {
	const { bg, text } = buttonConfigs[formType];
	const { dispatch } = useFormModal();

	return (
		<Box
			as="button"
			onClick={(e) => {
				e.stopPropagation();
				dispatch({ type: actionTypes.SET_FORM_TYPE, payload: formType })
			}}
			bg={bg}
			borderRadius="md"
			p={2}
			_hover={{
				bg: `${bg.split('.')[0]}.200`,
				cursor: 'pointer',
			}}
			_active={{ bg: `${bg.split('.')[0]}.250` }}
		>
			<ResponsiveText>{text}</ResponsiveText>
		</Box>
	);
};
export default ActionButton;