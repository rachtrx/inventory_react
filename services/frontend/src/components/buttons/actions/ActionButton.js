import { ACTION_TEXT, ICON_MAP } from '../constants';
import { useFormModal } from '../../../context/ModalProvider';
import { DefaultButton, CircleButton } from './Button';

const withActionLogic = (WrappedComponent) => {
  return ({ formType, initialValues, isMulti = false, textSize = "sm", icon=undefined, ...rest }) => {
	  const bg = rest?.bg || formType;
    const text = rest?.text || ACTION_TEXT[formType];
    const { setFormType, setInitialValues } = useFormModal();

    const handleClick = () => {
      setInitialValues(initialValues);
      setFormType(formType);
    };

	const IconComponent = icon || ICON_MAP[formType] || null;

    return (
      <WrappedComponent
        onClick={handleClick}
        bg={bg}
        text={text}
        isMulti={isMulti}
        textSize={textSize}
		icon={IconComponent}
        {...rest}
      />
    );
  };
};

export const ActionButton = withActionLogic(DefaultButton);
export const CircleActionButton = withActionLogic(CircleButton);
