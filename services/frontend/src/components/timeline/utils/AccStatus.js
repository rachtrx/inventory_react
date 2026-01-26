import { HStack } from "@chakra-ui/react"
import CheckBadge from "../../badges/CheckBadge"
import WarningBadge from "../../badges/WarningBadge"

const AccStatus = ({accLoan}) => {

    const allReturned = accLoan.unreturned === 0

    const accName = accLoan.accType.accessoryName;

    return (
        <>
            {allReturned ? (
                <CheckBadge text={`${accName}: ${accLoan.returned}/${accLoan.count}`} />
            ) : (
                <WarningBadge text={`${accName}: ${accLoan.returned}/${accLoan.count}`} />
            )}
        </>
    );
}

const AstStatus = ({astLoan}) => {

    const returned = astLoan.returnEvent ? 1 : 0
    const serialNumber = astLoan.asset.serialNumber

    return (
        <>
            {returned ? (
                <CheckBadge text={`${serialNumber}: ${returned}/1`} />
            ) : (
                <WarningBadge text={`${serialNumber}: ${returned}/1`} />
            )}
        </>
    );
}

export { AstStatus, AccStatus };