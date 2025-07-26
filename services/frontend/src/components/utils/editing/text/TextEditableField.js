import { CheckIcon } from "@chakra-ui/icons";
import { Box, Button, Flex, Heading, Input, Textarea } from "@chakra-ui/react";
import { useDrawer } from "../../../../context/DrawerProvider";
import { useEffect, useState } from "react";
import EditCancelButton from "../../../forms/utils/EditCancelButton";
import { useEditMode } from "../../../../context/EditModeProvider";
import { ResponsiveText } from "../../ResponsiveText";
import { EditControl } from "./EditControl";

const withTextEditableField = (WrappedComponent) => (props) => {
  const { value, name } = props;

  const [newValue, setNewValue] = useState(value);
  const { editKey, currentItem, updateItem } = useDrawer();
  const { editable } = useEditMode();

  useEffect(() => {
    setNewValue(value);
  }, [editable, value, editKey]);

  const handleUpdate = async () => {
    await updateItem({ name, newValue, itemId: currentItem.breadcrumbId });
  };

  return (
    <WrappedComponent
      {...props}
			value={value}
			newValue={newValue}
			setNewValue={setNewValue}
      handleUpdate={handleUpdate}
      name={name}
    />
  );
};

const HeadingField = ({ value, newValue, setNewValue, handleUpdate, name, ...props }) => {

	const { editKey } = useDrawer();
	const { editable } = useEditMode();

	return (
		<>
			{editKey === name && editable ? (
				<EditControl 
					isRemarks={false} 
					handleUpdate={handleUpdate} 
					value={value} 
					newValue={newValue} 
					setNewValue={setNewValue}
					isFloat={props?.isFloat} 
					size="lg"
				/>
			) : 
				<Heading as="h1" size="lg" mb={4} {...props}>{value}</Heading> 
				}
			<EditCancelButton size="md" name={name}/>
		</>
	)
}

const TextField = ({ value, newValue, setNewValue, handleUpdate, name, ...props }) => {

	const { label, ...rest } = props;
	const { editKey } = useDrawer();
	const { editable } = useEditMode();

	return (
		<>
			{label && <ResponsiveText size="md">{label}:</ResponsiveText>}

			{editKey === name && editable ? (
				<EditControl 
					isRemarks={label === 'Remarks'} 
					handleUpdate={handleUpdate} 
					value={value} 
					newValue={newValue} 
					setNewValue={setNewValue}
					isFloat={props?.isFloat} 
					size="md"
				/>
			) : 
				<ResponsiveText size="md" {...rest}>{value}</ResponsiveText> 
				}
			<EditCancelButton size="sm" name={name}/>
		</>
	)
}

export const HeadingEditableField = withTextEditableField(HeadingField);
export const TextEditableField = withTextEditableField(TextField);

export default TextEditableField;