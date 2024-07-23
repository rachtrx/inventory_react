import { VStack, Tooltip, Wrap, WrapItem, Flex, Popover, PopoverTrigger, PopoverContent, PopoverArrow, PopoverCloseButton, PopoverHeader, PopoverBody } from "@chakra-ui/react";
import { ItemLink } from "../buttons/ItemLink";
import ActionButton from "../buttons/ActionButton";
import { formTypes } from "../../context/ModalProvider";
import { ResponsiveText } from "../utils/ResponsiveText";
import { CircleInitials, CircleInitialsTooltip } from "../utils/CircleInitials";

export const AssetList = ({ user }) => {
  return (
		<Popover placement="bottom">
			<PopoverTrigger >
				<Wrap
					spacing={1}
					align="center"
					display="inline-flex"
				>
					{user.assets.map((asset) => (
						<WrapItem key={asset.id}>
							<Tooltip label={asset.assetType} placement="top" hasArrow>
								<CircleInitials text={asset.assetType}/>
							</Tooltip>
						</WrapItem>
					))}
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
						<ActionButton formType={formTypes.RETURN} item={user.assets} />
					</Flex>
				</PopoverHeader>
				<PopoverBody
					maxHeight={'200px'} // Set the maximum height
					overflowY={'auto'}  // Enable vertical scrolling
				>
					<VStack>
						{user.assets.map((asset) => (
							<Flex gap={2} width="100%" alignItems="center" justifyContent="space-between">
								<Tooltip label={asset.assetType} placement="top" hasArrow>
									<CircleInitials text={asset.assetType}/>
								</Tooltip>
								<ItemLink item={asset} />
								<ActionButton formType={formTypes.RETURN} item={asset} />
							</Flex>
						))}
					</VStack>
				</PopoverBody>
			</PopoverContent>
		</Popover>
  );
};