import { Box, Flex, Heading, Text } from "@chakra-ui/react";
import { useDrawer } from "../../../../context/DrawerProvider";
import { useEffect, useState } from "react";
import EditCancelButton from "../../../forms/utils/EditCancelButton";
import { useEditMode } from "../../../../context/EditModeProvider";
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
					size="2xl"
					mb={4}
					flex="1"
				/>
			) : 
				<Heading as="h1" mb={4} whiteSpace="normal" wordBreak="break-all" {...props}>{value}</Heading> 
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
			{label && <Text fontSize="md">{label}:</Text>}

			{editKey === name && editable ? (
				<EditControl 
					isRemarks={label === 'Remarks'} 
					handleUpdate={handleUpdate} 
					value={value} 
					newValue={newValue} 
					setNewValue={setNewValue}
					isFloat={props?.isFloat}
				/>
			) : 
				<Text fontSize="md" whiteSpace="normal" wordBreak="break-all" {...rest}>{value}</Text> 
				}
			<EditCancelButton size="sm" name={name}/>
		</>
	)
}

export const HeadingEditableField = withTextEditableField(HeadingField);
export const TextEditableField = withTextEditableField(TextField);

export default TextEditableField;