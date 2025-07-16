import { PopoverTrigger, Wrap, WrapItem } from "@chakra-ui/react"
import { OverlappingCircles } from "../utils/CircleText"
import { generateDataFromLoan } from "../utils/popovers/loanDetails"

export const LoanTrigger = ({ loans }) => {
    return (
        <PopoverTrigger >
            <Wrap
                spacing={1}
                align="center"
                display="inline-flex"
            >
                {loans.length > 0 && loans.map(loan => (
                    <WrapItem key={loan.loanId}>
                        <OverlappingCircles
                            data={generateDataFromLoan(loan)}
                        />
                    </WrapItem>
                ))}
            </Wrap>
        </PopoverTrigger>
    )
}