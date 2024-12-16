import { VStack, Tooltip, HStack, Flex,
	PopoverArrow,
	PopoverBody,
	PopoverCloseTrigger,
	PopoverContent,
	PopoverRoot,
	PopoverHeader,
	PopoverFooter,
	PopoverTrigger
} from "@chakra-ui/react";
import { ItemLink } from "../buttons/ItemLink";
import ActionButton from "../buttons/ActionButton";
import { formTypes } from "../../context/ModalProvider";
import { ResponsiveText } from "../utils/ResponsiveText";
import { CircleText, CircleTextTooltip, OverlappingCircles } from "../utils/CircleText";
import { useRef } from "react"

export const AssetList = ({ user }) => {

	const ref = useRef(null)

  	return (
		<PopoverRoot placement="bottom" initialFocusEl={() => ref.current}>
			<PopoverTrigger >
				<HStack
					wrap="wrap"
					gap={1}
					align="center"
					display="inline-flex"
				>
					{user.userLoans
						.map(userLoan => userLoan.loan)
						.map((loan) => {
							if (loan.astLoan && loan.accLoans && loan.accLoans.length > 0) {
								return (
									<OverlappingCircles key={loan.astLoan.asset.assetId}>
										<Tooltip label={loan.astLoan.asset.typeName} placement="top" hasArrow>
											<CircleText text={loan.astLoan.asset.typeName} />
										</Tooltip>
										{loan.accLoans.map((accLoan) => (
											<Tooltip 
												key={accLoan.accessoryLoanId} 
												label={accLoan.accessoryName} 
												placement="top" 
												hasArrow
											>
												<CircleText text={accLoan.unreturned} />
											</Tooltip>
										))}
									</OverlappingCircles>
								);
							} else if (loan.astLoan) {
								return (
									<Flex align="flex-start" key={loan.astLoan.asset.assetId}>
										<Tooltip label={loan.astLoan.asset.typeName} placement="top" hasArrow>
											<CircleText text={loan.astLoan.asset.typeName} />
										</Tooltip>
									</Flex>
								);
							} else {
								return (loan.accLoans.map((accLoan) => 
									(<Flex align="flex-start" key={accLoan.accessoryLoanId}>
										<Tooltip label={accLoan.accessoryName} placement="top" hasArrow>
											<CircleText text={accLoan.unreturned} />
										</Tooltip>
									</Flex>)
								))
							}
						})
					}
				</HStack>
			</PopoverTrigger>
			<PopoverContent 
				width="auto"
			>
				<PopoverArrow />
				<PopoverCloseTrigger />
				<PopoverHeader>
					<Flex gap={2} alignItems={'center'}>
						<ResponsiveText size="sm" fontWeight="bold">Assets</ResponsiveText>
						<ActionButton formType={formTypes.RETURN} item={user.userLoans} />
					</Flex>
				</PopoverHeader>
				<PopoverBody
					maxHeight={'200px'} // Set the maximum height
					overflowY={'auto'}  // Enable vertical scrolling
				>
					<VStack>
						{user.userLoans.map(userLoan => userLoan.loan).map((loan) => (
							<Flex key={loan.astLoan.asset.assetId} gap={2} width="100%" alignItems="center" justifyContent="space-between">
								<Tooltip label={loan.astLoan.asset.typeName} placement="top" hasArrow>
									<CircleText text={loan.astLoan.asset.typeName}/>
								</Tooltip>
								<ItemLink item={loan.astLoan.asset} />
								<ActionButton formType={formTypes.RETURN} item={loan.astLoan.asset} />
							</Flex>
						))}
					</VStack>
				</PopoverBody>
			</PopoverContent>
		</PopoverRoot>
  );
};