import { IconButton } from "@chakra-ui/react";
import { CloseIcon, EditIcon } from "@chakra-ui/icons";
import { useDrawer } from "../../../context/DrawerProvider";
import { useEditMode } from "../../../context/EditModeProvider";

const EditCancelButton = ({name, ...props}) => {

    const { size, ...rest } = props
    const { editKey, setEditKey } = useDrawer();
    const { editable } = useEditMode();

    return (
        <>
            {!editable || !editKey || editKey !== name ? (
                <IconButton
                    size={size || "sm"}
                    colorScheme="yellow" 
                    icon={<EditIcon />}
                    onClick={() => setEditKey(name)}
                    disabled={editKey !== null || !editable }
                />
            ) : (
                <IconButton
                    size={size || "sm"}
                    colorScheme="red" 
                    icon={<CloseIcon />}
                    onClick={() => setEditKey(null)}
                    {...rest}
                />
            )}
        </>
    )
}

export default EditCancelButton;