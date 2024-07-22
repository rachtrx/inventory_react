import { Box, VStack, Circle, Text, Button, Flex, Input } from '@chakra-ui/react';
import { EditIcon, DownloadIcon, CheckIcon } from '@chakra-ui/icons';
import { useState } from 'react';
import { useDrawer } from '../context/DrawerProvider';
import EditableField from './utils/EditableField';
import { Field, Form, Formik } from 'formik';

const Timeline = ({ events }) => {

    const { handleAddRemark } = useDrawer()

    return (
        <VStack align="stretch" position="relative" before={{
            content: '""',
            width: "2px",
            bg: "gray.200",
            position: "absolute",
            left: "50%",
            top: 0,
            bottom: 0,
            transform: "translateX(-50%)"
        }}>
            {events.map((ev, id) => (
            <Flex key={id} direction="column" alignItems="center">
                <Circle size="8" bg="blue.500" color="white" mb="4">
                    {events.length - id}
                </Circle>
                <Box p="4" bg="gray.50" borderRadius="md" shadow="md" textAlign="center" mb="4" w="100%">
                    <Text fontSize="md" fontWeight="bold">
                        {new Date(ev.eventDate).toLocaleString('en-SG', { timeZone: 'Asia/Singapore' })}
                    </Text>
                    <Text fontSize="sm">{ev.eventType}</Text>
                    <VStack spacing={4} align="stretch">
                        {ev.remarks.map((remark, index) => (
                            <Text key={index} fontSize="xs">
                                {remark.text} - <i>remarked by {remark.authorisedUserId} on {new Date(remark.remarkedAt).toLocaleDateString()}</i>
                            </Text>
                        ))}
                    </VStack>
                    <Formik
                        initialValues={{ remark: '' }}
                        onSubmit={(values, { setSubmitting, resetForm }) => {
                            if (values.remark.trim()) {
                                handleAddRemark(ev.id, values.remark, Date.now());
                                resetForm();
                            }
                            setSubmitting(false);
                        }}
                    >
                        {({ isSubmitting }) => (
                        <Form>
                            <Field as={Input} name="remark" placeholder="Add a remark..." size="sm" />
                            <Button mt="2" size="sm" type="submit" isLoading={isSubmitting}>
                                Add Remark
                            </Button>
                        </Form>
                        )}
                    </Formik>
                    {ev.filePath && (
                        <Button size="sm" leftIcon={<DownloadIcon />} data-event-id={ev.id} mr="2">
                            Download PDF
                        </Button>
                    )}
                </Box>
            </Flex>
        ))}
        </VStack>
    );
};

export default Timeline;
