import { Box, Collapse, Flex, Text, Tooltip } from "@chakra-ui/react"
import { AccTypeLink, AssetLink } from "../../buttons/ItemLink"
import { CircleText, OverlappingCircles } from "../../utils/CircleText"
import { AssetActionButton } from "../../buttons/actions/AssetActionButton"
import { ReturnButton } from "../../buttons/actions/ReturnButton"
import { FormType } from "../../../context/ModalProvider"


export const ItemsLine = ({ data, loanId, astLoan={}, accLoans }) => {
    return (		
        <Flex justify="space-between" align="center">
            <OverlappingCircles
                textSize="xs"
                data={data}
            />
            {astLoan?.asset && <AssetLink textSize="xs" asset={astLoan.asset} />}
            {!astLoan?.asset && <AccTypeLink textSize="xs" accType={accLoans[0].accType} />}
            <ReturnButton textSize="xs" loanId={loanId} />
        </Flex>
    )
}