import { CheckCircleIcon } from "@chakra-ui/icons"
import { Badge, Icon } from "@chakra-ui/react"

const CheckBadge = ({text, colorScheme=undefined}) => {
    return (
        <Badge
            colorScheme={colorScheme ? colorScheme : "yellow"}
            fontSize="0.8em"
            borderRadius="md"
        >
            <Icon as={CheckCircleIcon} mr={1} />
            {text}
        </Badge>
    )
}

export default CheckBadge;