import { Box, Flex, Button, Icon, CloseButton } from "@chakra-ui/react";
import { FaEdit } from "react-icons/fa";
import { ResponsiveText } from "../../utils/ResponsiveText"
import { EditButton, RemoveButton } from "./ItemButtons";
import { useState } from "react";

export const LoanSummary = ({ loan, handleEdit, handleRemove, isOnlyLoan }) => {

    const [focused, setFocused] = useState(false)

    return (
      <Box
        border="1px solid"
        borderColor="gray.300"
        borderRadius="md"
        p={4}
        mb={4}
        boxShadow="sm"
        position="relative"
        onMouseEnter={() => setFocused(true)}  // Set focused to true on hover
        onMouseLeave={() => setFocused(false)} // Set focused to false when hover ends
        _hover={{ 
          boxShadow: "md" 
        }}
      >
        {focused && (
          <Flex position="absolute" top="1" right="1">
            <RemoveButton
              handleClick={handleRemove}
              size="sm"
              isDisabled={isOnlyLoan}
            />
            <EditButton handleClick={handleEdit} size="sm">
              Edit
            </EditButton>
          </Flex>
        )}
        <Flex direction="column" gap={2}>
          <ResponsiveText fontWeight="bold">
            Assets: 
            <ResponsiveText as="span" fontWeight="normal">
              {loan.assets.map((asset) => asset.name).join(', ')}
            </ResponsiveText>
          </ResponsiveText>
          <ResponsiveText fontWeight="bold">
            Users: 
            <ResponsiveText as="span" fontWeight="normal">
              {loan.users.map((user) => user.id).join(', ')}
            </ResponsiveText>
          </ResponsiveText>
          
        </Flex>
      </Box>
    );
  };