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
} from "@chakra-ui/react";
import { ChatIcon, AddIcon } from "@chakra-ui/icons";
import { Formik, Form, Field } from "formik";
import AddRemark from "./AddRemark";
import { useDrawer } from "../../context/DrawerProvider";

const RemarksPopover = ({ remarks = [] }) => {
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
                    {/* Existing Remarks */}
                    <VStack align="stretch" spacing={3} mb={4}>
                        {remarks.length > 0 ? (
                            remarks.map((remark, idx) => (
                                <Text
                                    key={idx}
                                    fontSize="sm"
                                    color="gray.700"
                                    borderLeft="2px solid"
                                    borderColor="blue.400"
                                    pl={2}
                                >
                                    {remark.text || "No remark"}
                                </Text>
                            ))
                        ) : (
                            <Text fontSize="sm" color="gray.500">
                                No remarks yet.
                            </Text>
                        )}
                    </VStack>

                    {/* Add Remark Button */}
                    <AddRemark />
                </PopoverBody>
            </PopoverContent>
        </Popover>
    );
};

export default RemarksPopover;
