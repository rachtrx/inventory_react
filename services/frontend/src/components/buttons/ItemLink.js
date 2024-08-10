import { Flex } from "@chakra-ui/react";
import { useDrawer } from "../../context/DrawerProvider";
import { ResponsiveText } from "../utils/ResponsiveText";
import { IoCopyOutline } from "react-icons/io5";
import { useUI } from "../../context/UIProvider";
import { getDisplayValue } from "../../config";

export const ItemLink = ({ item, isCopy=true, ...props }) => {
    const { handleItemClick } = useDrawer();
    const { showToast, handleError } = useUI()

    const handleCopyClick = async (e) => {
        try { 
            await navigator.clipboard.writeText(getDisplayValue(item));
            showToast(`${getDisplayValue(item)} copied!`, 'success', 500);
        } catch (error) {
            handleError(error);
        }
    };

    return (
        <Flex 
            justifyContent="flex-start" 
            alignItems="center" 
            gap={1} 
            cursor="pointer" 
            width='100%'
            {...props}
        >
            <ResponsiveText
                onClick={(e) => {
                    handleItemClick(item);
                }}
                _hover={{
                    color: "blue.500",
                }}
            >
                {getDisplayValue(item)}
            </ResponsiveText>
            {isCopy && <IoCopyOutline 
                onClick={handleCopyClick}
                cursor="pointer"
                size="1em"
            />}
        </Flex>
    );
};