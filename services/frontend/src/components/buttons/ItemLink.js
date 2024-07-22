import { Flex } from "@chakra-ui/react";
import { useDrawer } from "../../context/DrawerProvider";
import { ResponsiveText } from "../utils/ResponsiveText";
import { IoCopyOutline } from "react-icons/io5";
import { useUI } from "../../context/UIProvider";

export const ItemLink = ({ item, setHoveredFn, isCopy=true, ...props }) => {
    const { handleItemClick } = useDrawer();
    const { showToast, handleError } = useUI()

    const handleCopyClick = async (e) => {
        e.stopPropagation();
        try {
            await navigator.clipboard.writeText(item.assetTag || item.name);
            showToast(item.assetTag ? 'Asset copied!' : 'User copied!', 'success', 500);
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
            onMouseEnter={() => setHoveredFn && setHoveredFn(item.id)}
            onMouseLeave={() => setHoveredFn && setHoveredFn(null)}
            {...props}
        >
            <ResponsiveText
                onClick={(e) => {
                    e.stopPropagation();
                    handleItemClick(item);
                }}
                _hover={{
                    color: "blue.500",
                }}
            >
                {item.assetTag || item.name}
            </ResponsiveText>
            {isCopy && <IoCopyOutline 
                onClick={handleCopyClick}
                cursor="pointer"
                size="1em"
            />}
        </Flex>
    );
};