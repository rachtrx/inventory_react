import { AddIcon, DeleteIcon } from "@chakra-ui/icons";
import { Button, IconButton } from "@chakra-ui/react";
import { ResponsiveText } from "../../utils/ResponsiveText";
import { FaEdit } from "react-icons/fa";

export const withItemButton = (IconComponent, colorScheme) => ({ 
    ariaLabel, 
    handleClick, 
    isDisabled = false, 
    label = null, 
    ...props 
}) => {
    return label ? (
        <Button
            p={1}
            aria-label={ariaLabel}
            leftIcon={<IconComponent />}  // Render the icon component here
            onClick={handleClick}
            size="sm"
            variant="ghost"
            colorScheme={colorScheme}
            isDisabled={isDisabled}
            {...props}
        >
            <ResponsiveText>{label}</ResponsiveText>
        </Button>
    ) : (
        <IconButton
            aria-label={ariaLabel}
            icon={<IconComponent />}  // Render the icon component here
            onClick={handleClick}
            size="sm"
            variant="ghost"
            colorScheme={colorScheme}
            isDisabled={isDisabled}
            {...props}
        />
    );
};

export const AddButton = withItemButton(AddIcon, "teal");
export const RemoveButton = withItemButton(DeleteIcon, "red");
export const EditButton = withItemButton(FaEdit, 'yellow')