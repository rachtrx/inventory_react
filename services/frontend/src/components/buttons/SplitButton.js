import { Box, Text, VStack } from "@chakra-ui/react";
import { ItemLink } from "./ItemLink";
import ActionButton from "./ActionButton";
import { formTypes } from "../../context/ModalProvider";

export const SplitButton = ({ renderLeftButton, renderRightButton, onMouseEnterFn = () => null, onMouseLeaveFn = () => null }) => { // These 2 functions ensure that hovering the button does not hover the parent element

	return (
		<Box
			display="flex"
			w="100%"
			bg="blue.50"
			borderRadius="md"
			overflow="hidden"
			onMouseEnter={onMouseEnterFn}
			onMouseLeave={onMouseLeaveFn}
		>
			<Box borderRight="1px solid white" flex="1">
        {renderLeftButton()}
      </Box>
      <Box borderLeft="1px solid white" flex="1">
        {renderRightButton()}
      </Box>
		</Box>
	)
}

export const UserActionButton = ({ user, setHoveredUserId }) => {
	return (
	  <>
		{user.assets && user.assets.length > 0 ? (
		  <>
				<VStack
					align="stretch"
					spacing={2}
					overflowY="auto"
					maxH="50px"
				>
					{user.assets.map((asset) => (
						<Box key={asset.id} w="100%">
							<SplitButton
								renderLeftButton={() => <ItemLink item={asset}/>}
								renderRightButton={() => <ActionButton formType={formTypes.RETURN} item={asset}/>}
								onMouseEnterFn={() => setHoveredUserId(user.id)}
								onMouseLeaveFn={() => setHoveredUserId(null)}
							/>
						</Box>
					))}
			</VStack>
		  </>
		) : !user.deletedDate ? (
		  <SplitButton
				renderLeftButton={() => <ActionButton formType={formTypes.LOAN} item={user} />}
				renderRightButton={() => <ActionButton formType={formTypes.DEL_USER} item={user} />}
				onMouseEnterFn={() => setHoveredUserId(user.id)}
				onMouseLeaveFn={() => setHoveredUserId(null)}
		  />
		) : (
			<ActionButton formType={formTypes.RESTORE_USER} item={user} />
		)}
	  </>
	);
};

export const AssetActionButton = ({ asset, setHoveredAssetId }) => {
  return (
    <>
      {asset.user ? (
        <SplitButton
          renderLeftButton={() => <ItemLink item={asset.user} />}
          renderRightButton={() => <ActionButton formType={formTypes.RETURN} item={asset} />}
          onMouseEnterFn={() => setHoveredAssetId(asset.id)}
          onMouseLeaveFn={() => setHoveredAssetId(null)}
        />
      ) : !asset.deletedDate ? (
        <SplitButton
          renderLeftButton={() => <ActionButton formType={formTypes.LOAN} item={asset} />}
          renderRightButton={() => <ActionButton formType={formTypes.DEL_ASSET} item={asset} />}
          onMouseEnterFn={() => setHoveredAssetId(asset.id)}
          onMouseLeaveFn={() => setHoveredAssetId(null)}
        />
      ) : (
				<ActionButton formType={formTypes.RESTORE_ASSET} item={asset} />
			)}
    </>
  );
};