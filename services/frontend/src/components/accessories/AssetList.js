import { VStack, Tooltip, Wrap, WrapItem, Flex, Popover, PopoverTrigger, PopoverContent, PopoverArrow, PopoverCloseButton, PopoverHeader, PopoverBody } from "@chakra-ui/react";
import { AssetLink } from "../buttons/ItemLink";
import { AssetActionButton } from "../buttons/ActionButton";
import { FormType } from "../../context/ModalProvider";
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
								<AssetLink asset={loan.asset} />
								<AssetActionButton formType={FormType.RETURN} item={loan.asset} />
							</Flex>
						))}
					</VStack> */}
				</PopoverBody>
			</PopoverContent>
		</Popover>
  );
};