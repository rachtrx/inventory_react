import {
    Box,
    Text,
    VStack,
    HStack,
    IconButton,
    Popover,
    PopoverTrigger,
    PopoverContent,
    PopoverArrow,
    PopoverCloseButton,
    PopoverHeader,
    PopoverBody,
    Button,
    Textarea,
    useToast,
} from "@chakra-ui/react";
import { ChatIcon, AddIcon } from "@chakra-ui/icons";

const RemarksPopover = ({ children }) => {

    return (
        <Popover placement="right" isLazy>
            <PopoverTrigger>
                <IconButton
                    icon={<ChatIcon />}
                    aria-label="View Remarks"
                    variant="ghost" // Subtle appearance
                    size="sm"
                    _hover={{}} // Add hover effect
                />
            </PopoverTrigger>
            <PopoverContent borderRadius="md" boxShadow="md">
                <PopoverArrow />
                <PopoverCloseButton />
                <PopoverHeader fontWeight="bold" borderBottom="1px solid" borderColor="gray.200">
                    Remarks
                </PopoverHeader>
                <PopoverBody>
                    {children}
                </PopoverBody>
            </PopoverContent>
        </Popover>
    );
};

export default RemarksPopover;
