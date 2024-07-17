import { Box, VStack, Circle, Text, Button, Flex, Input } from '@chakra-ui/react';
import { EditIcon, DownloadIcon, CheckIcon } from '@chakra-ui/icons';
import { useState } from 'react';
import { useDrawer } from '../context/DrawerProvider';
import EditableField from './utils/EditableField';

const Timeline = ({ events }) => {

    const { handleRemarksSave } = useDrawer()

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
                    <EditableField
                        label="Remarks"
                        fieldKey={ev.id}
                        value={ev.remarks}
                        handleSave={handleRemarksSave}
                    />
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
