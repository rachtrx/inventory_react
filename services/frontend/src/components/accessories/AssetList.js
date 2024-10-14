import { VStack, Tooltip, Wrap, WrapItem, Flex, Popover, PopoverTrigger, PopoverContent, PopoverArrow, PopoverCloseButton, PopoverHeader, PopoverBody } from "@chakra-ui/react";
import { ItemLink } from "../buttons/ItemLink";
import ActionButton from "../buttons/ActionButton";
import { formTypes } from "../../context/ModalProvider";
import { ResponsiveText } from "../utils/ResponsiveText";
import { CircleText, CircleTextTooltip, OverlappingCircles } from "../utils/CircleText";

// TODO NOT IMPLEMENTED!

export const AssetList = ({ assets }) => {

  	return (
		<Popover placement="bottom">
			<PopoverTrigger >
				<Wrap
					spacing={1}
					align="center"
					display="inline-flex"
				>
                    <Tooltip label={assets.length} placement="top" hasArrow>
                        <CircleText text={assets.length} />
                    </Tooltip>
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
					</Flex>
				</PopoverHeader>
				<PopoverBody
					maxHeight={'200px'} // Set the maximum height
					overflowY={'auto'}  // Enable vertical scrolling
				>
					{/* <VStack>
						{user.loans.map((loan) => (
							<Flex gap={2} width="100%" alignItems="center" justifyContent="space-between">
								<Tooltip label={loan.asset.typeName} placement="top" hasArrow>
									<CircleText text={loan.asset.typeName}/>
								</Tooltip>
								<ItemLink item={loan.asset} />
								<ActionButton formType={formTypes.RETURN} item={loan.asset} />
							</Flex>
						))}
					</VStack> */}
				</PopoverBody>
			</PopoverContent>
		</Popover>
  );
};