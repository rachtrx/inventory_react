import { Badge, HStack } from "@chakra-ui/react"

const BadgeGroup = ({ asset, accessories }) => {

    return (
        <HStack spacing={2}>
            {asset && <AssetBadge asset={asset} />}
            {accessories.map((accessory, idx) => (
                <AccessoryBadge key={idx} accessory={accessory}/>
            ))}
        </HStack>
    );
};

const AccessoryBadge = ({ accessory }) => {

    return (
        <Badge
            colorScheme={accessory.isMatching ? "purple" : "pink"}
            borderRadius="md"
            px={2}
            py={1}
            fontSize="0.8em"
        >
            {`${accessory.accessoryName}, X${accessory.count}`}
        </Badge>
    )
}

const AssetBadge = ({ asset }) => {

    return (
        <Badge
            colorScheme={"pink"}
            borderRadius="md"
            px={2}
            py={1}
            fontSize="0.8em"
        >
            {asset.serialNumber}
        </Badge>
    );
};

export {BadgeGroup, AssetBadge};