// UserCards.jsx
import {
  VStack,
  Text,
  CardBody,
  Flex,
} from "@chakra-ui/react";
import { FormType } from "../../context/FormProvider";
import { UserItemsList } from "../utils/popovers/ItemsList";
import { ItemStarButton } from "../buttons/StarButton";
import { UserLink } from "../buttons/ItemLink";
import { Tags } from "../tags/Tags";
import { UserActionButton } from "../buttons/actions/UserActionButton";
import SelectableCards from "../utils/SelectableCards";

function UserCards({ items }) {
  const renderCard = (user) => {
    return {
      body: (
        <>
          <Flex>
            <VStack align="start" flex="1">
              <UserLink user={user} size="lg" fontWeight="bold" />
              <Text fontSize="md" fontWeight="semibold">
                {user.deptName}
              </Text>
              {user.loans?.length > 0 && <UserItemsList loans={user.loans} />}
              <Tags tags={user.tags} textSize="xs" />
            </VStack>

            <ItemStarButton
              id={user.userId}
              isBookmarked={user.bookmarked}
            />
          </Flex>
          {!user.deleteEvent && (
            <UserActionButton
              formType={FormType.LOAN}
              user={user}
              flex="1"
              borderRadius="0"
            />
          )}       
        </>
      ),
    };
  };

  return <SelectableCards items={items} renderCard={renderCard} />;
}

export default UserCards;
