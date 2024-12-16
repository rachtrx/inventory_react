import { Box, Text, List, ListItem, Flex, Separator, HStack, Icon, IconButton, Collapsible, Textarea, Button } from "@chakra-ui/react";
import { FiMessageCircle, FiCalendar, FiInfo, FiPlusCircle } from "react-icons/fi";
import { Field, Form, Formik } from "formik";
import { useState } from "react";

const AddRemark = ({ eventId, handleAddRemark }) => {
    const [open, setIsOpen] = useState(false);

    return (
        <Box>
            {/* Toggle Button */}
            <IconButton
                icon={<FiPlusCircle />}
                size="sm"
                aria-label="Add Remark"
                onClick={() => setIsOpen(!open)}
                colorPalette="blue"
                variant="ghost"
                mb={2}
            />

            {/* Collapsible Textarea */}
            <Collapsible open={open} animateOpacity>
                <Formik
                    initialValues={{ remark: "" }}
                    onSubmit={(values, { setSubmitting, resetForm }) => {
                        if (values.remark.trim()) {
                            handleAddRemark(eventId, values.remark, Date.now());
                            resetForm();
                            setIsOpen(false); // Collapse after submit
                        }
                        setSubmitting(false);
                    }}
                >
                    {({ isSubmitting }) => (
                        <Form>
                            <Field
                                as={Textarea}
                                name="remark"
                                placeholder="Write a remark..."
                                size="sm"
                                borderRadius="md"
                                border="1px solid"
                                borderColor="gray.300"
                                mb={2}
                                _focus={{
                                    borderColor: "blue.400",
                                    boxShadow: "0 0 0 1px blue.400",
                                }}
                            />
                            <Button
                                size="sm"
                                type="submit"
                                colorPalette="blue"
                                isLoading={isSubmitting}
                            >
                                Submit
                            </Button>
                        </Form>
                    )}
                </Formik>
            </Collapsible>
        </Box>
    );
};

export default AddRemark;
