// EventCards.jsx
import {
  CardBody,
  Text,
  Flex,
  VStack,
} from "@chakra-ui/react";
import { ItemStarButton } from '../buttons/StarButton';
import { AccTypeLink, AssetLink, UserLink } from '../buttons/ItemLink';
import { Tags } from '../tags/Tags';
import SelectableCards from "../utils/SelectableCards";

function EventCards({ items }) {
  const renderCard = (event) => {
    return {
      props: {
        bg: event.type,
				_hover: undefined
      },
      body: (
        <Flex>
					<VStack align="start" flex="1">
						<Text>{event.type}</Text>
						<Text>{event.eventDate}</Text>
						{event.asset && <AssetLink asset={event.asset} withTooltip={true}/>}
						{event.user && <UserLink user={event.user} withTooltip={true}/>}
						{event.accessories && Array.isArray(event.accessories) && (
							event.accessories.map(({ accessoryType, count }, idx) => (
								<AccTypeLink key={idx} accType={accessoryType} />
							))
						)}
						{event.tags && <Tags tags={event.tags} textSize="xs" />}
						<Text fontSize="sm">{event.adminName}</Text>
					</VStack>

					<ItemStarButton
						id={event.eventId}
						isBookmarked={event.bookmarked}
					/>
				</Flex>
      ),
    };
  };

  return <SelectableCards items={items} renderCard={renderCard} />;
}

export default EventCards;
