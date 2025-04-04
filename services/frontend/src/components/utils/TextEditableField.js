import { CheckIcon, EditIcon } from "@chakra-ui/icons";
import { Box, Button, Flex, Input, Text, Textarea } from "@chakra-ui/react";
import { useDrawer } from "../../context/DrawerProvider";
import { useState } from "react";
import EditCancelButton from "../forms/utils/EditCancelButton";

function TextEditableField({ label, name, value }) {

	const [newValue, setNewValue] = useState(value);
	const { editKey, setEditKey, handleSave } = useDrawer()

	const handleUpdate = () => {
		handleSave(name, newValue);
	}

	return (
		<>
			<Text fontSize="md">{label}:</Text>
			{editKey === name ? (
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
								onChange={e => setNewValue(e.target.value)}
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
						>
							Save
						</Button>
					</Flex>
				</Box>
			) : <Text>{value}</Text> }
			<EditCancelButton name={name}/>
		</>
	);
}
  
export default TextEditableField;