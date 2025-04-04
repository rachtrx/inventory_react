import { CheckIcon, EditIcon } from "@chakra-ui/icons";
import { Box, Button, Flex, Input, Text, Textarea } from "@chakra-ui/react";
import { useDrawer } from "../../context/DrawerProvider";
import { useState } from "react";
import EditCancelButton from "../forms/utils/EditCancelButton";
import { useUI } from "../../context/UIProvider";
import { useLoading } from "../../context/LoadingProvider";

function TextEditableField({ isFloat, label, name, value }) {

	const [newValue, setNewValue] = useState(value);
	const { editKey, updateState, currentItem } = useDrawer()
	const { handleError, showToast } = useUI();
	const { setLoading } = useLoading();

	const handleUpdate = async () => {
		setLoading(true);
		try {
			const response = await currentItem.service.updateItem({name, newValue, itemId: currentItem.breadcrumbId});
			await updateState();
			showToast(response.data.message, 'success', 500);
		} catch (err) {
			console.error(err);
			handleError(err)
		} finally {
			setLoading(false);
		}
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
								type={isFloat ? "number": undefined}
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