import { VStack, Tooltip, Wrap, WrapItem, Flex, Popover, PopoverTrigger, PopoverContent, PopoverArrow, PopoverCloseButton, PopoverHeader, PopoverBody } from "@chakra-ui/react";
import { ItemLink } from "../buttons/ItemLink";
import ActionButton from "../buttons/ActionButton";
import { formTypes } from "../../context/ModalProvider";
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
										<Tooltip label={loan.asset.assetType} placement="top" hasArrow>
											<CircleText text={loan.asset.assetType} />
										</Tooltip>
										{loan.peripherals.map((peripheral) => (
											<Tooltip label={peripheral.peripheralName} placement="top" hasArrow>
												<CircleText text={peripheral.count} />
											</Tooltip>
										))}
									</OverlappingCircles>
								);
							} else if (loan.asset) {
								return (
									<WrapItem key={loan.asset.id}>
										<Tooltip label={loan.asset.assetType} placement="top" hasArrow>
											<CircleText text={loan.asset.assetType} />
										</Tooltip>
									</WrapItem>
								);
							} else {
								return (loan.peripherals.map((peripheral) => 
									(<WrapItem key={peripheral.id}>
										<Tooltip label={peripheral.peripheralName} placement="top" hasArrow>
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
					<Flex gap={2} alignItems={'center'}>
						<ResponsiveText size="sm" fontWeight="bold">Assets</ResponsiveText>
						<ActionButton formType={formTypes.RETURN} item={user.loans} />
					</Flex>
				</PopoverHeader>
				<PopoverBody
					maxHeight={'200px'} // Set the maximum height
					overflowY={'auto'}  // Enable vertical scrolling
				>
					<VStack>
						{user.loans.map((loan) => (
							<Flex gap={2} width="100%" alignItems="center" justifyContent="space-between">
								<Tooltip label={loan.asset.assetType} placement="top" hasArrow>
									<CircleText text={loan.asset.assetType}/>
								</Tooltip>
								<ItemLink item={loan.asset} />
								<ActionButton formType={formTypes.RETURN} item={loan.asset} />
							</Flex>
						))}
					</VStack>
				</PopoverBody>
			</PopoverContent>
		</Popover>
  );
};