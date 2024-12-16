import { FiCheck, FiEdit } from "react-icons/fi";
import { Button, Input, Text, Textarea } from "@chakra-ui/react";
import { useDrawer } from "../../context/DrawerProvider";

function EditableField({ label, fieldKey, value }) {

	const { editKey, editedValue, handleEdit, handleChange, handleSave } = useDrawer()

	return (
		<>
			<Text fontSize="md">{label}:</Text>
			<Text fontSize="md">
				{editKey === fieldKey ? 
					label === 'Remarks' ? (
						<Textarea
							value={editedValue}
							onChange={e => handleChange(e)}
							autoFocus
					/>) : (
						<Input
							value={editedValue}
							onChange={e => handleChange(e)}
							autoFocus
						/>
					) : value
				}
			</Text>
			{editKey === fieldKey ? (
				<Button leftIcon={<FiCheck />} colorPalette="green" onClick={() => handleSave()}>
					Save
				</Button>
			) : (
				<Button
					leftIcon={<FiEdit />}
					onClick={() => handleEdit(fieldKey, value)}
					disabled={editKey !== null}
				>
					Edit
				</Button>
			)}
		</>
	);
}
  
export default EditableField;