// AccessoryCards.jsx
import {
  VStack,
  Text,
  CardBody,
  Flex,
} from "@chakra-ui/react";
import { CircleAccTypeActionButton } from "../buttons/actions/AccTypeActionButton";
import { FormType } from "../../context/FormProvider";
// import { useItems } from "../../context/ItemsProvider";
import { CircleText } from "../utils/CircleText";
import { AccTypeLink } from "../buttons/ItemLink";
import { LoansPopover } from "./LoansPopover";
import accessoryService from "../../services/AccessoryService";
import SelectableCards from "../utils/SelectableCards";

function AccessoryCards({ items }) {
  // const { handleUpdate } = useItems();

  const renderCard = (accessoryType) => {
    return {
      body: (
        <CardBody>
          <Flex>
            <VStack align="start" flex="1">
              <Flex gap={1}>
                <AccTypeLink accType={accessoryType} size="lg" fontWeight="bold" />
                <CircleAccTypeActionButton
                  size="sm"
                  formType={FormType.UPDATE_ACC}
                  accTypeIds={accessoryType.accessoryTypeId}
                />
              </Flex>

              <Flex
                direction="column"
                justifyContent="space-evenly"
                alignSelf="stretch"
                gap={1}
              >
                <Flex gap={1}>
                  <CircleText text={accessoryType.stock ? accessoryType.stock : 0} />
                  <Text>Available</Text>
                </Flex>

                <Flex gap={1}>
                  <CircleText text={accessoryType.registeredCount ? accessoryType.registeredCount : 0} />
                  <Text>Registered</Text>
                </Flex>

                <Flex gap={1}>
                  <LoansPopover
                    accessoryType={accessoryType}
                    searchFunc={(id) => accessoryService.getLoanDetails(id)}
                    count={accessoryType.loanCount}
                  />
                  <Text>Loaned</Text>
                </Flex>

                <Flex gap={1}>
                  <LoansPopover
                    accessoryType={accessoryType}
                    searchFunc={(id) => accessoryService.getReservationDetails(id)}
                    count={accessoryType.reserveCount}
                  />
                  <Text>Reserved</Text>
                </Flex>
              </Flex>
            </VStack>
          </Flex>
        </CardBody>
      ),
    };
  };

  return (
    <SelectableCards items={items} renderCard={renderCard} />
  );
}

export default AccessoryCards;
