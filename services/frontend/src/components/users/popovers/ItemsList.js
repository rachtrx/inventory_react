import { VStack, Tooltip, Wrap, WrapItem, Flex, Popover, PopoverTrigger, PopoverContent, PopoverArrow, PopoverCloseButton, PopoverHeader, PopoverBody, Box, Collapse, Text } from "@chakra-ui/react";
import { AssetLink } from "../../buttons/ItemLink";
import { FormType } from "../../../context/ModalProvider";
import { ResponsiveText } from "../../utils/ResponsiveText";
import { CircleText, CircleTextTooltip, OverlappingCircles } from "../../utils/CircleText";
import { ItemsLine } from "./ItemsLine";
import { ReturnButton } from "../../buttons/actions/ReturnButton";

export const ItemsList = ({ user }) => {

	const generateDataFromLoan = (loan) => {
		const data = []
		if (loan.astLoan?.asset) { // ast exists
			data.push({
				text: loan.astLoan.asset.typeName,
				label: loan.astLoan.asset.typeName
			})
		}
		if (loan.accLoans?.length) {
			data.push(...loan.accLoans.map(accLoan => ({
				text: accLoan.accType.accessoryName,
				label: `${accLoan.accType.accessoryName} x${accLoan.unreturned}`
			})))
		}
		if (data.length ===0)
		console.log(loan);
		return data;
	}

  	return (
		<Popover placement="bottom" isLazy>
			<PopoverTrigger >
				<Wrap
					spacing={1}
					align="center"
					display="inline-flex"
				>
					{user.loans.length > 0 && user.loans.map(loan => (
						<WrapItem key={loan.loanId}>
							<OverlappingCircles
								data={generateDataFromLoan(loan)}
							/>
						</WrapItem>
					))}
				</Wrap>
			</PopoverTrigger>
			<PopoverContent 
				width="auto"
				overflow="visible"
			>
				<PopoverArrow />
				<PopoverCloseButton />
				<PopoverHeader>
					{/* RETURN BUTTONS */}
					<Flex justifyContent="space-between">
						<ResponsiveText size="sm" fontWeight="bold">Loans</ResponsiveText>
						{/* RETURN ALL LOANS BUTTON */}
						<ReturnButton
							loanId={user.loans.map(loan => loan.loanId)}
							textSize="xs"
						/>
					</Flex>
				</PopoverHeader>
				<PopoverBody maxHeight="200px" overflowY="auto">
					{/* Assets Section */}
					<VStack spacing={2} align="stretch">
						{user.loans
						.map((loan) => (
							<ItemsLine 
								key={loan.loanId}
								data={generateDataFromLoan(loan)}
								loanId={loan.loanId}
								astLoan={loan.astLoan}
								accLoans={loan.accLoans}
							/>))}
					</VStack>
				</PopoverBody>
			</PopoverContent>
		</Popover>
  );
};