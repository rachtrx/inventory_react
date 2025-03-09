import { Box, HStack } from "@chakra-ui/react"

export const withEventBox = (Component) => {
    return (props) => {
        return (
            <Box position="relative">
                {/* Event Content */}
                <Box
                    p={2}
                    bg="gray.50"
                    borderRadius="lg"
                    boxShadow="md"
                    border="1px solid"
                    borderColor="gray.200"
                    w="100%"
                >
                    <Component {...props} /> {/* ✅ Render the Component properly */}
                </Box>
            </Box>
        );
    };
};

// export const AccReserveEventBox = withEventBox(AccReserveEvent)
