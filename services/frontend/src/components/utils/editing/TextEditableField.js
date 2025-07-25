import { CheckIcon, EditIcon } from "@chakra-ui/icons";
import { Box, Button, Flex, Heading, Input, Text, Textarea } from "@chakra-ui/react";
import { useDrawer } from "../../../context/DrawerProvider";
import { useEffect, useState } from "react";
import EditCancelButton from "../../forms/utils/EditCancelButton";
import { useEditMode } from "../../../context/EditModeProvider";

function TextEditableField({ isFloat, label, name, value, isHeading=false, textProps }) {

	const [newValue, setNewValue] = useState(value);
	const { editKey, currentItem, updateItem } = useDrawer()
	const { editable } = useEditMode();

	useEffect(() => {
		setNewValue(value);
	}, [editable, value, editKey])

	const handleUpdate = async () => {
		await updateItem({name, newValue, itemId: currentItem.breadcrumbId});
	}

	const TextComponent = isHeading ? Heading : Text;

	return (
		<>
			{label && <Text fontSize="md">{label}:</Text>}

			{editKey === name && editable ? (
				<Box position="relative">
					<Text fontSize="md">
						{label === 'Remarks' ? (
							<Textarea
								value={newValue}
								onChange={e => setNewValue(e.target.value)}
								autoFocus
							/>) : (
							<Input
								value={newValue}
								size={isHeading? "lg": undefined}
								onChange={e => setNewValue(e.target.value)}
								type={isFloat ? "number": undefined}
								flex="1"
								autoFocus
							/>
						)}
					</Text>
					<Flex
						position="absolute"
						direction="column"
						left="0"
						right="0"
						mt="2"
						style={{ top: '100%' }}
						gap={2}
					>
						<Button 
							leftIcon={<CheckIcon />} 
							colorScheme="green" 
							onClick={handleUpdate}
							alignSelf="start"
							disabled={newValue === value}
						>
							Save
						</Button>
					</Flex>
				</Box>
			) : 

			<TextComponent {...textProps}>{value}</TextComponent> }
			<EditCancelButton name={name}/>
		</>
	);
}
  
export default TextEditableField;