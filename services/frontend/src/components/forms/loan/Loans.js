import { Box } from "@chakra-ui/react"
import { LoanStep1 } from "./LoanStep1"
import { LoansProvider, useLoansContext } from "../../../context/LoansProvider"
import { LoanStep2 } from "./LoanStep2"

export const Loans = () => {

	const { step} = useLoansContext()

    return (
			<LoansProvider>
				<Box>
					{step === 1 && <LoanStep1/>}
					{step === 2 && <LoanStep2/>}
				</Box>
			</LoansProvider>
		)
}