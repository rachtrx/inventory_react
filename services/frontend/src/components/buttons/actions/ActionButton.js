import { ACTION_COLORS, ACTION_TEXT, ICON_MAP } from '../constants';
import { useFormModal } from '../../../context/ModalProvider';
import { DefaultButton, CircleButton } from './Button';
import { FaTools } from 'react-icons/fa';

const withActionLogic = (WrappedComponent, isIcon=false) => {
	return ({ formType, initialValues, isMulti = false, textSize = "sm", ...rest }) => {
		const bg = `${ACTION_COLORS[formType]}.200`;
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
				icon={isIcon ? (ICON_MAP[formType] || <FaTools />) : undefined}
				{...rest}
			/>
		);
	};
};
  
export const ActionButton = withActionLogic(DefaultButton);
export const CircleActionButton = withActionLogic(CircleButton, true);
