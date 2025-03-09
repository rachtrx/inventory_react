import { Box, Button } from '@chakra-ui/react';
import { ACTION_COLORS, ACTION_TEXT } from '../constants';
import { actionTypes, FormType, useFormModal } from '../../../context/ModalProvider';
import { ResponsiveText } from '../../utils/ResponsiveText';
import { createNewReturn } from '../../forms/asset/return/ReturnSearch';
import assetService from '../../../services/AssetService';
import { useUI } from '../../../context/UIProvider';

const withActionLogic = (WrappedComponent) => {
	return ({ formType, initialValues, isMulti = false, textSize = "sm", ...rest }) => {
		const bg = ACTION_COLORS[formType];
		const text = ACTION_TEXT[formType];
		const { setFormType, setInitialValues } = useFormModal();
	
		const handleClick = () => {
			setInitialValues(initialValues);
			setFormType(formType);
		};
	
		return (
			<WrappedComponent
				onClick={handleClick}
				bg={bg}
				text={text}
				isMulti={isMulti}
				textSize={textSize}
				{...rest}
			/>
		);
	};
};
  
const DefaultButton = ({ onClick, bg, text, isMulti, textSize, ...rest }) => (
	<Box
		as="button"
		onClick={onClick}
		bg={bg}
		borderRadius="md"
		p={2}
		_hover={{ bg: `${bg.split(".")[0]}.200`, cursor: "pointer" }}
		_active={{ bg: `${bg.split(".")[0]}.250` }}
		{...rest}
	>
	  	<ResponsiveText size={textSize}>{text}{isMulti && " All"}</ResponsiveText>
	</Box>
);
  
export const ActionButton = withActionLogic(DefaultButton);
