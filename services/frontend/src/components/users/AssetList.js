import { VStack, Tooltip, Wrap, WrapItem, Flex, Popover, PopoverTrigger, PopoverContent, PopoverArrow, PopoverCloseButton, PopoverHeader, PopoverBody, Box, Collapse, Text } from "@chakra-ui/react";
import { AssetLink } from "../buttons/ItemLink";
import { AccessoryLoanActionButton, AssetActionButton } from "../buttons/ActionButton";
import { FormType } from "../../context/ModalProvider";
import { ResponsiveText } from "../utils/ResponsiveText";
import { CircleText, CircleTextTooltip, OverlappingCircles } from "../utils/CircleText";

export const AssetList = ({ user }) => {

  	return (
		<Popover placement="bottom">
			<PopoverTrigger >
				<Wrap
					spacing={1}
					align="center"
					display="inline-flex"
				>
					{user.loans
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
												label={accLoan.accType.accessoryName} 
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
									<WrapItem key={loan.astLoan.asset.assetId}>
										<Tooltip label={loan.astLoan.asset.typeName} placement="top" hasArrow>
											<CircleText text={loan.astLoan.asset.typeName} />
										</Tooltip>
									</WrapItem>
								);
							} else {
								return (loan.accLoans.map((accLoan) => 
									(<WrapItem key={accLoan.accessoryLoanId}>
										<Tooltip label={accLoan.accType.accessoryName} placement="top" hasArrow>
											<CircleText text={accLoan.unreturned} />
										</Tooltip>
									</WrapItem>)
								))
							}
						})
					}
				</Wrap>
			</PopoverTrigger>
			<PopoverContent 
				width="auto"
			>
				<PopoverArrow />
				<PopoverCloseButton />
				<PopoverHeader>
					<Flex gap={2} alignItems={'center'}>
						<ResponsiveText size="sm" fontWeight="bold">Loans</ResponsiveText>
						{user.loans && user.loans.filter(loan => loan.astLoan).length > 0 ? 
							(<Flex gap={2} alignItems={'center'}>
								<AssetActionButton
									formType={FormType.RETURN} 
									asset={user.loans
										.filter(loan => loan.astLoan)
										.map(loan => loan.astLoan.asset)
									}
								/>
							</Flex>) : null}
						{user.loans && user.loans.filter(loan => !loan.astLoan).length > 0 ? 
							(<Flex gap={2} alignItems={'center'}>
								<AccessoryLoanActionButton // TODO check?
									formType={FormType.RETURN}
									accLoan={user.loans
										.filter(loan => !loan.astLoan)
										.flatMap(loan => loan.accLoans)
										.reduce((allAccTypeLoans, accLoan) => {
											const accTypeLoan = allAccTypeLoans.find(accType => accType.accessoryTypeId === accLoan.accType.accessoryTypeId);
											if (accTypeLoan) accTypeLoan.unreturned += accLoan.unreturned
											else allAccTypeLoans.push(accLoan);

											return allAccTypeLoans;
										}, [])
									}
								/>
							</Flex>) : null}
					</Flex>
				</PopoverHeader>
				<PopoverBody maxHeight="200px" overflowY="auto">
				{/* Assets Section */}
				<VStack spacing={4} align="stretch">
					{user.loans
					.filter((loan) => loan.astLoan)
					.map((loan) => {
						return (
						<Box key={loan.astLoan.asset.assetId} border="1px" borderRadius="md" p={2}>
							<Flex justify="space-between" align="center">
							<Tooltip label={loan.astLoan.asset.typeName} placement="top" hasArrow>
								<CircleText text={loan.astLoan.asset.typeName} />
							</Tooltip>
							<AssetLink asset={loan.astLoan.asset} />
							<AssetActionButton formType={FormType.RETURN} asset={loan.astLoan.asset} />
							</Flex>
							{/* Collapsible Accessories */}
							{loan.accLoans && loan.accLoans.length > 0 && (
							<Collapse in={true}>
								<Box mt={2}>
								{loan.accLoans.map((accLoan) => (
									<Flex key={accLoan.accessoryLoanId} justify="space-between" px={2}>
									<Tooltip label={accLoan.accType.accessoryName} placement="top" hasArrow>
										<CircleText text={accLoan.accType.accessoryName}/>
									</Tooltip>
									<Text>{accLoan.unreturned}</Text>
									</Flex>
								))}
								</Box>
							</Collapse>
							)}
						</Box>
						);
					})}
				</VStack>

				{/* Standalone Accessories Section */}
				<Box mt={4}>
					<Text fontWeight="bold" mb={2}>
					Standalone Accessories
					</Text>
					<VStack spacing={2} align="stretch">
					{user.loans
						.filter((loan) => !loan.astLoan)
						.flatMap((loan) => loan.accLoans)
						.map((accLoan) => (
						<Flex key={accLoan.accessoryLoanId} justify="space-between" px={2}>
							<Tooltip label={accLoan.accType.accessoryName} placement="top" hasArrow>
								<CircleText text={accLoan.accType.accessoryName}/>
							</Tooltip>
							<Text>{accLoan.unreturned}</Text>
							<AccessoryLoanActionButton formType={FormType.RETURN} accLoan={accLoan} />
						</Flex>
						))}
					</VStack>
				</Box>
				</PopoverBody>
			</PopoverContent>
		</Popover>
  );
};