import { Flex } from "@chakra-ui/react";
import { useDrawer } from "../../context/DrawerProvider";
import { ResponsiveText } from "../utils/ResponsiveText";
import { IoCopyOutline } from "react-icons/io5";
import { useUI } from "../../context/UIProvider";
import { Tooltip } from "@chakra-ui/react";
import { forwardRef } from "react";

export const AssetLink = ({ asset, withTooltip = false, ...props }) => {
  const { handleAssetClick } = useDrawer();

  const content = (
    <ItemLink
      item={asset}
      value="serialNumber"
      handleClick={handleAssetClick}
      {...props}
    />
  );

  return withTooltip && asset.typeName ? (
    <Tooltip label={asset.typeName}>
      {content}
    </Tooltip>
  ) : (
    content
  );
};

export const UserLink = ({ user, withTooltip = false, ...props }) => {
  const { handleUserClick } = useDrawer();

  const content = (
    <ItemLink
      item={user}
      value="userName"
      handleClick={handleUserClick}
      {...props}
    />
  );

  return withTooltip && user.deptName ? (
    <Tooltip label={user.deptName} hasArrow>
      {content}
    </Tooltip>
  ) : (
    content
  );
};

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

const ItemLink = forwardRef(({
  item,
  value,
  handleClick,
  isCopy = true,
  bg = null,
  textSize = "sm",
  display = "inline-flex",
  ...props
}, ref) => {
  const { showToast, handleError } = useUI();
  const text = item[value];

  const handleCopyClick = async (e) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast(`${text} copied!`, 'success', 500);
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <Flex
      ref={ref}
      justifyContent="flex-start"
      alignItems="center"
      gap={1}
      cursor="pointer"
      bg={bg || 'gray.200'}
      p={2}
      display={display}
      {...props}
    >
      <ResponsiveText
        size={textSize}
        onClick={() => handleClick(item)}
        _hover={{ color: "blue.500" }}
      >
        {text}
      </ResponsiveText>
      {isCopy && (
        <IoCopyOutline
          onClick={handleCopyClick}
          cursor="pointer"
          size="1em"
        />
      )}
    </Flex>
  );
});
