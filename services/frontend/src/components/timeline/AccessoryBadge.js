import { Badge, HStack } from "@chakra-ui/react"

const AccessoryBadge = ({ accessories, accTypeId=null }) => {
    return (
        <HStack spacing={2}>
            {accessories.map((accReturn, idx) => (
                <Badge
                    key={idx}
                    colorScheme={!accTypeId || accReturn.accessoryTypeId !== accTypeId ? "purple" : "pink"}
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