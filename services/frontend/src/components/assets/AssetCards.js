// AssetCards.jsx
import {
  CardBody,
  Box,
  Flex,
  VStack,
  Text,
} from "@chakra-ui/react";
import { ItemStarButton } from '../buttons/StarButton';
import { AssetLink, UserLink } from '../buttons/ItemLink';
import { CardActions } from './CardActions';
import { Tags } from '../tags/Tags';
import SelectableCards from "../utils/SelectableCards";

function AssetCards({ items }) {

  const renderCard = (asset) => {
    return {
      body: (
        <>
					<Flex>
						<VStack align="start" flex="1">
							<AssetLink asset={asset} size="lg" fontWeight="bold" />
							<Box>
								<Text fontWeight="semibold" fontSize="sm">{asset.typeName}</Text>
								<Text fontSize="sm">{asset.subTypeName}</Text>
							</Box>
							{asset.loan && <UserLink user={asset.loan.user} />}
							<Tags tags={asset.tags} textSize="xs" />
						</VStack>

						<ItemStarButton
							id={asset.assetId}
							isBookmarked={asset.bookmarked}
						/>
					</Flex>
					<CardActions asset={asset} flex="1" borderRadius="0" />
        </>
      )
    };
  };

return <SelectableCards items={items} renderCard={renderCard} />;
}

export default AssetCards;
