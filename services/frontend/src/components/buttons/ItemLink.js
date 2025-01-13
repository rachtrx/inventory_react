import { Box, Flex } from "@chakra-ui/react";
import { useDrawer } from "../../context/DrawerProvider";
import { ResponsiveText } from "../utils/ResponsiveText";
import { IoCopyOutline } from "react-icons/io5";
import { useUI } from "../../context/UIProvider";
import { getDisplayValue } from "../../config";

export const AssetLink = ({asset, ...props}) => {

    const { handleAssetClick } = useDrawer();

    return (
        <ItemLink
            item={asset}
            value="serialNumber"
            handleClick={handleAssetClick}
            {...props}
        />
    )
}

export const UserLink = ({user, ...props}) => {

    const { handleUserClick } = useDrawer();

    return (
        <ItemLink
            item={user}
            value="userName"
            handleClick={handleUserClick}
            {...props}
        />
    )
}

export const AccTypeLink = ({accType, ...props}) => {

    const { handleAccTypeClick } = useDrawer();

    return (
        <ItemLink
            item={accType}
            value="accessoryName"
            handleClick={handleAccTypeClick}
            {...props}
        />
    )
}

const ItemLink = ({ 
    item, 
    key,
    value,
    handleClick, 
    isCopy=true, 
    bg=null, 
    ...props 
}) => {
    const { showToast, handleError } = useUI();
    const text = item[value]

    const handleCopyClick = async (e) => {
        try { 
            await navigator.clipboard.writeText(text);
            showToast(`${text} copied!`, 'success', 500);
        } catch (error) {
            handleError(error);
        }
    };

    // console.log(item);

    return (
        <Flex
            justifyContent="flex-start"
            alignItems="center" 
            gap={1} 
            cursor="pointer"
            bg={bg || 'gray.200'}
            p={2}
            display="inline-flex"
            {...props}
        >
            <ResponsiveText
                onClick={(e) => {
                    handleClick(item);
                }}
                _hover={{
                    color: "blue.500",
                }}
            >
                {text}
            </ResponsiveText>
            {isCopy && <IoCopyOutline 
                onClick={handleCopyClick}
                cursor="pointer"
                size="1em"
            />}
        </Flex>
    );
};