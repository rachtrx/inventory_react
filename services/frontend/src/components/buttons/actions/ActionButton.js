import { ACTION_TEXT, ICON_MAP } from '../constants';
import { useForm } from '../../../context/FormProvider';
import { DefaultButton, CircleButton } from './Button';
import { useFormModal } from '../../forms/control/FormModalProvider';
import { formStyleMap } from '../../forms/control/helpers';

const withActionLogic = (WrappedComponent) => {
  return ({ formType, initialValues, isMulti = false, textSize = "sm", icon=undefined, isModal=true, ...rest }) => {
	  const styles = rest?.styles || formStyleMap[formType];
    const text = rest?.text || ACTION_TEXT[formType];
    const { setFormType, setInitialValues } = useForm();
    const { onOpen } = useFormModal();

    const handleClick = () => {
      setInitialValues(initialValues);
      setFormType(formType);
      if (isModal) onOpen();
      // else 
    };

	const IconComponent = icon || ICON_MAP[formType] || null;

    return (
      <WrappedComponent
        onClick={handleClick}
        text={text}
        isMulti={isMulti}
        textSize={textSize}
		    icon={IconComponent}
        {...rest}
        {...styles}
      />
    );
  };
};

export const ActionButton = withActionLogic(DefaultButton);
export const CircleActionButton = withActionLogic(CircleButton);
