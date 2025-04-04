import { Button, IconButton } from "@chakra-ui/react";
import { CloseIcon, EditIcon } from "@chakra-ui/icons";
import { useDrawer } from "../../../context/DrawerProvider";

const EditCancelButton = ({name}) => {

    const { editKey, setEditKey } = useDrawer();

    return (
        <>
            {!editKey || editKey !== name ? (
                <IconButton
                    colorScheme="yellow" 
                    icon={<EditIcon />}
                    onClick={() => setEditKey(name)}
                    disabled={editKey !== null}
                />
            ) : (
                <IconButton
                    colorScheme="red" 
                    icon={<CloseIcon />}
                    onClick={() => setEditKey(null)}
                />
            )}
        </>
    )
}

export default EditCancelButton;