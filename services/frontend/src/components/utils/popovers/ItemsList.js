import { VStack, Wrap, WrapItem, Flex, Popover, PopoverTrigger, PopoverContent, PopoverArrow, PopoverCloseButton, PopoverHeader, PopoverBody, Text } from "@chakra-ui/react";
import { CircleText, OverlappingCircles } from "../CircleText";
import { ItemsLine } from "./ItemsLine";
import { ReturnButton } from "../../buttons/actions/ReturnButton";

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

export const ItemsList = ({ loans, children }) => {

  	return (
		<Popover placement="bottom" isLazy>
			{children}
			<PopoverContent 
				width="auto"
				overflow="visible"
			>
				<PopoverArrow />
				<PopoverCloseButton />
				<PopoverHeader>
					{/* RETURN BUTTONS */}
					<Flex justifyContent="space-between">
						<Text fontSize="sm" fontWeight="bold">Loans</Text>
						{/* RETURN ALL LOANS BUTTON */}
						<ReturnButton
							loanId={loans.map(loan => loan.loanId)}
							textSize="xs"
						/>
					</Flex>
				</PopoverHeader>
				<PopoverBody maxHeight="200px" overflowY="auto">
					{/* Assets Section */}
					<VStack spacing={2} align="stretch">
						{loans
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

export const UserItemsList = ({loans}) => {
	return (
		<ItemsList loans={loans}>
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
		</ItemsList>
	)
}

export const AccItemsList = ({ loans, circleText, onClick }) => {
  return (
    <ItemsList loans={loans}>
      <PopoverTrigger>
        <Wrap spacing={1} align="center" display="inline-flex">
          <CircleText
            text={circleText}
            onClick={onClick}
          />
        </Wrap>
      </PopoverTrigger>
    </ItemsList>
  );
};