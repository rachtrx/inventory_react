import {
    Box,
    Text,
    VStack,
    HStack,
    IconButton,
    PopoverArrow,
	PopoverBody,
	PopoverCloseTrigger,
	PopoverContent,
	PopoverRoot,
	PopoverHeader,
	PopoverFooter,
	PopoverTrigger
} from "@chakra-ui/react";
import { FiMessageCircle } from "react-icons/fi";
import { Formik, Form, Field } from "formik";
import AddRemark from "./AddRemark";
import { useDrawer } from "../../context/DrawerProvider";
import { useRef } from "react"

const RemarksPopover = ({ remarks = [] }) => {

    const ref = useRef(null)

    return (
        <PopoverRoot placement="right" initialFocusEl={() => ref.current} isLazy>
            <PopoverTrigger>
                <IconButton
                    icon={<FiMessageCircle />}
                    aria-label="View Remarks"
                    variant="ghost" // Subtle appearance
                    size="sm"
                    _hover={{}} // Add hover effect
                />
            </PopoverTrigger>
            <PopoverContent borderRadius="md" boxShadow="md">
                <PopoverArrow />
                <PopoverCloseTrigger />
                <PopoverHeader fontWeight="bold" borderBottom="1px solid" borderColor="gray.200">
                    Remarks
                </PopoverHeader>
                <PopoverBody>
                    {/* Existing Remarks */}
                    <VStack align="stretch" gap={3} mb={4}>
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
        </PopoverRoot>
    );
};

export default RemarksPopover;
