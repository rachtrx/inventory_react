import { Badge, HStack } from "@chakra-ui/react"
import { useTimeline } from "../../context/TImelineProvider";

const BadgeGroup = ({ asset, accessories }) => {

    return (
        <HStack spacing={2}>
            {asset && <AssetBadge asset={asset} />}
            {accessories.map((accReturn, idx) => (
                <AccessoryBadge key={idx} accReturn={accReturn}/>
            ))}
        </HStack>
    );
};

const AccessoryBadge = ({ accReturn }) => {
    const { accessoryTypeId } = useTimeline();

    return (
        <Badge
            colorScheme={accReturn.accessoryTypeId !== accessoryTypeId ? "purple" : "pink"}
            borderRadius="md"
            px={2}
            py={1}
            fontSize="0.8em"
        >
            {`${accReturn.accessoryName}, X${accReturn.count}`}
        </Badge>
    )
}

const AssetBadge = ({ asset }) => {

    const { assetId } = useTimeline();

    return (
        <Badge
            colorScheme={asset.assetId !== assetId ? "purple" : "pink"}
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