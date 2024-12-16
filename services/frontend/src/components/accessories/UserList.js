import { VStack, Tooltip, HStack, Flex } from "@chakra-ui/react";
import {
	PopoverArrow,
	PopoverBody,
	PopoverCloseTrigger,
	PopoverContent,
	PopoverRoot,
	PopoverHeader,
	PopoverFooter,
	PopoverTrigger,
} from "@/components/ui/popover"
import { ItemLink } from "../buttons/ItemLink";
import ActionButton from "../buttons/ActionButton";
import { formTypes } from "../../context/ModalProvider";
import { ResponsiveText } from "../utils/ResponsiveText";
import { CircleText, CircleTextTooltip, OverlappingCircles } from "../utils/CircleText";
import { useRef } from "react"

export const AssetList = ({ user }) => {

	const ref = null;

  	return (
		<PopoverRoot placement="bottom" initialFocusEl={() => ref.current}>
			<PopoverTrigger >
				<HStack
					wrap="wrap"
					gap={1}
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
									<Flex align="flex-start" key={loan.asset.assetId}>
										<Tooltip label={loan.asset.typeName} placement="top" hasArrow>
											<CircleText text={loan.asset.typeName} />
										</Tooltip>
									</Flex>
								);
							} else {
								return (loan.peripherals.map((peripheral) => 
									(<Flex align="flex-start" key={peripheral.id}>
										<Tooltip label={peripheral.accessoryName} placement="top" hasArrow>
											<CircleText text={peripheral.count} />
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
								<Tooltip label={loan.asset.typeName} placement="top" hasArrow>
									<CircleText text={loan.asset.typeName}/>
								</Tooltip>
								<ItemLink item={loan.asset} />
								<ActionButton formType={formTypes.RETURN} item={loan.asset} />
							</Flex>
						))}
					</VStack>
				</PopoverBody>
			</PopoverContent>
		</PopoverRoot>
  );
};