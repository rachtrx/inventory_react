import { CheckCircleIcon, WarningIcon } from "@chakra-ui/icons"
import { Badge, Icon } from "@chakra-ui/react"

const WarningBadge = ({text}) => {
    return (
        <Badge
            colorScheme="red"
            fontSize="0.8em"
            borderRadius="md"
        >
            <Icon as={WarningIcon} mr={1} />
            {text}
        </Badge>
    )
}

export default WarningBadge;