import { Box, Text, List, ListItem, Flex, Divider, HStack, Icon, IconButton, Collapse, Textarea, Button } from "@chakra-ui/react";
import { ChatIcon, CalendarIcon, InfoOutlineIcon, AddIcon } from "@chakra-ui/icons";
import { Field, Form, Formik } from "formik";
import { useState } from "react";
import { useTimeline } from "../../context/TImelineProvider";
import assetService from "../../services/AssetService";
import { useUI } from "../../context/UIProvider";
import eventService from "../../services/EventService";

const AddRemark = ({ eventId }) => {
    const [isOpen, setIsOpen] = useState(false);

    const { setLoading, handleError, showToast } = useUI();

    return (
        <Box>
            {/* Toggle Button */}
            <IconButton
                icon={<AddIcon />}
                size="sm"
                aria-label="Add Remark"
                onClick={() => setIsOpen(!isOpen)}
                colorScheme="blue"
                variant="ghost"
                mb={2}
            />

            {/* Collapsible Textarea */}
            <Collapse in={isOpen} animateOpacity>
                <Formik
                    initialValues={{ remark: "" }}
                    onSubmit={async (values, { setSubmitting, resetForm }) => {
                        if (values.remark.trim()) {
                            try {
                                await eventService.addRemark(eventId, values.remark, Date.now());
                                setSubmitting(false);
                                setLoading(false);
                                showToast('Remark added', 'success', 500);
                            } catch (err) {
                                console.error(err);
                                handleError(err);
                                console.error("Error Handled");
                                setLoading(false);
                            }
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
                                colorScheme="blue"
                                isLoading={isSubmitting}
                            >
                                Submit
                            </Button>
                        </Form>
                    )}
                </Formik>
            </Collapse>
        </Box>
    );
};

export default AddRemark;
