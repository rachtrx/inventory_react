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
    Flex,
    useColorModeValue,

} from "@chakra-ui/react";
import { ChatIcon } from "@chakra-ui/icons";
import { RemarkInput } from "../RemarkInput";

const RemarksPopover = ({ remarks, eventId }) => {

    const dividerColor = useColorModeValue("black", "white") // Copied from Chakra

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
            <PopoverContent borderRadius="md" boxShadow="md" textTransform="none">
                <PopoverArrow />
                <PopoverCloseButton />
                <PopoverHeader fontWeight="bold" borderBottom="1px solid" borderColor="gray.200">
                    Remarks
                </PopoverHeader>
                <PopoverBody>
                    <VStack align="stretch" spacing={3} mb={4} overflowY="auto">
                        {remarks.length > 0 ? (
                            remarks.map((remark, idx) => (
                                <Flex key={idx} alignItems="stretch">
                                    <Text fontSize="sm" whiteSpace="nowrap">
                                        {remark.remarkDate}
                                    </Text>

                                    <Box
                                        width="1px"
                                        bgColor={dividerColor}
                                        mx={1}
                                        alignSelf="stretch"
                                    />

                                    <Text
                                        fontSize="sm"
                                        whiteSpace="normal"
                                    >
                                        {remark.text || "No remark"}
                                    </Text>
                                </Flex>
                            ))
                        ) : (
                            <Text fontSize="sm" color="gray.500">
                                No remarks yet.
                            </Text>
                        )}
                    </VStack>
                    <RemarkInput eventId={eventId}/>
                </PopoverBody>
            </PopoverContent>
        </Popover>
    );
};

export default RemarksPopover;
