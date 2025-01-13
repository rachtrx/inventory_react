import { VStack, Tooltip, Wrap, WrapItem, Flex, Popover, PopoverTrigger, PopoverContent, PopoverArrow, PopoverCloseButton, PopoverHeader, PopoverBody, Text } from "@chakra-ui/react";
import { AssetLink } from "../buttons/ItemLink";
import { AssetActionButton } from "../buttons/ActionButton";
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
							if (loan.asset && loan.peripherals && loan.peripherals.length > 0) {
								return (
									<OverlappingCircles>
										<Tooltip label={loan.asset.typeName} placement="top" hasArrow>
											<CircleText text={loan.asset.typeName} />
										</Tooltip>
										{loan.peripherals.map((peripheral) => (
											<Tooltip label={peripheral.accessoryName} placement="top" hasArrow>
												<CircleText text={peripheral.count} />
											</Tooltip>
										))}
									</OverlappingCircles>
								);
							} else if (loan.asset) {
								return (
									<WrapItem key={loan.asset.assetId}>
										<Tooltip label={loan.asset.typeName} placement="top" hasArrow>
											<CircleText text={loan.asset.typeName} />
										</Tooltip>
									</WrapItem>
								);
							} else {
								return (loan.peripherals.map((peripheral) => 
									(<WrapItem key={peripheral.id}>
										<Tooltip label={peripheral.accessoryName} placement="top" hasArrow>
											<CircleText text={peripheral.count} />
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
					<ResponsiveText size="sm" fontWeight="bold">Assets</ResponsiveText>
					{user.userLoans && user.userLoans.filter(userLoan => userLoan.loan.astLoan).length > 0 ? 
						(<Flex gap={2} alignItems={'center'}>
							<AssetActionButton 
								formType={FormType.RETURN} 
								asset={user.userLoans
									.filter(userLoan => userLoan.loan.astLoan)
									.map(userLoan => userLoan.loan.astLoan.asset)
								}
							/>
						</Flex>) : null}
				</PopoverHeader>
				<PopoverBody
					maxHeight={'200px'} // Set the maximum height
					overflowY={'auto'}  // Enable vertical scrolling
				>
					<VStack>
						{user.userLoans.map((userLoan) => (
							<Flex gap={2} width="100%" alignItems="center" justifyContent="space-between">
								<Tooltip label={userLoan.loan.asset.typeName} placement="top" hasArrow>
									<CircleText text={userLoan.loan.asset.typeName}/>
								</Tooltip>
								<AssetLink asset={userLoan.loan.asset} />
								<AssetActionButton 
									formType={FormType.RETURN} 
									asset={userLoan.loan.asset} 
								/>
							</Flex>
						))}
					</VStack>
				</PopoverBody>
			</PopoverContent>
		</Popover>
  );
};