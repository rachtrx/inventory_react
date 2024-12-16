import { Badge, HStack } from "@chakra-ui/react"

const AccessoryBadge = ({ accessories }) => {
    return (
        <HStack gap={2}>
            {accessories.map((accReturn, idx) => (
                <Badge
                    key={idx}
                    colorPalette="purple"
                    borderRadius="md"
                    px={2}
                    py={1}
                    fontSize="0.8em"
                >
                    {`${accReturn.accessoryName}, X${accReturn.count}`}
                </Badge>
            ))}
        </HStack>
    );
};

export default AccessoryBadge;