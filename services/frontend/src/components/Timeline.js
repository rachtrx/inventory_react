import { Box, VStack, Circle, Text, Button, Flex } from '@chakra-ui/react';
import { EditIcon, DownloadIcon, CheckIcon } from '@chakra-ui/icons';

const Timeline = ({ events }) => {
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
                        {id + 1}
                    </Circle>
                    <Box p="4" bg="gray.50" borderRadius="md" shadow="md" textAlign="center" mb="4" w="100%">
                        <Text fontSize="md" fontWeight="bold">{ev.eventDate}</Text>
                        <Text fontSize="sm">{ev.eventType}</Text>
                        <Text fontSize="sm">{ev.remarks}</Text>
                        <Flex justify="center" mt="2">
                            <Button size="sm" leftIcon={<EditIcon />} mr="2">Edit</Button>
                            {ev.filePath && (
                                <Button size="sm" leftIcon={<DownloadIcon />} data-event-id={ev.eventId} mr="2">Download PDF</Button>
                            )}
                            <Button size="sm" leftIcon={<CheckIcon />} data-event-id={ev.eventId}>Save</Button>
                        </Flex>
                    </Box>
                </Flex>
            ))}
        </VStack>
    );
};

export default Timeline;
