import { HStack } from "@chakra-ui/react"
import CheckBadge from "../../badges/CheckBadge"
import WarningBadge from "../../badges/WarningBadge"

const AccStatus = ({accLoan}) => {
    return (
    <HStack>
        {/* Returned Count */}
        <CheckBadge text={`Returned: ${accLoan.returned}`}/>
        {/* Unreturned Count */}
        {accLoan.unreturned &&
            accLoan.unreturned > 0 && (
                <WarningBadge text={`Unreturned: ${accLoan.unreturned}`}/>
            )}
    </HStack>)
}

export default AccStatus;