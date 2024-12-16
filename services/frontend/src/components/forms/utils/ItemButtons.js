import { FiPlusCircle, FiTrash } from "react-icons/fi";
import { Button, IconButton } from "@chakra-ui/react";
import { ResponsiveText } from "../../utils/ResponsiveText";
import { FaEdit } from "react-icons/fa";

export const withItemButton = (IconComponent, colorPalette) => ({ 
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
            colorPalette={colorPalette}
            isDisabled={isDisabled}
            whiteSpace="normal"
            textAlign="left"
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
            colorPalette={colorPalette}
            isDisabled={isDisabled}
            {...props}
        />
    );
};

export const AddButton = withItemButton(FiPlusCircle, "teal");
export const RemoveButton = withItemButton(FiTrash, "red");
export const EditButton = withItemButton(FaEdit, 'yellow')