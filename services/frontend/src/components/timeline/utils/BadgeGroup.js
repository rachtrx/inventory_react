import { Badge, HStack } from "@chakra-ui/react"
import { useThemeFontSize } from "./useThemeFontSize";

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

    const fontSize = useThemeFontSize("sm");

    return (
        <Badge
            colorScheme={accessory.isMatching ? "purple" : "pink"}
            borderRadius="md"
            px={2}
            py={1}
            fontSize={fontSize}
        >
            {`${accessory.accessoryName}, X${accessory.count}`}
        </Badge>
    )
}

const AssetBadge = ({ asset }) => {

    const fontSize = useThemeFontSize("sm");

    return (
        <Badge
            colorScheme={"pink"}
            borderRadius="md"
            px={2}
            py={1}
            fontSize={fontSize}
        >
            {asset.serialNumber}
        </Badge>
    );
};

export {BadgeGroup, AssetBadge};