import {
  Text,
  Box,
  VStack,
  Badge,
} from "@chakra-ui/react";
import { AssetLink, UserLink } from "../buttons/ItemLink.js";
import SelectableCards from "../utils/SelectableCards.js";

function ReminderCards({ items }) {

	const today = new Date(new Date().toLocaleString("en-SG", { timeZone: "Asia/Singapore" }));
	today.setHours(0, 0, 0, 0);

  const renderCard = (reminder) => {
    const { loanId, user, astLoan, accLoans, expectedReturnDate, overdue } = reminder;
    const bg = overdue ? `${overdue}` : 'gray';
    const hoverBg = overdue ? `${overdue}Hover` : 'subtle';

    return {
      props: { 
        bg, 
        _hover: { bg: hoverBg } 
      },
      body: (
        <VStack align="start" spacing={1}>
          <Badge fontSize="sm" colorScheme="gray">
            Expected Return: {expectedReturnDate || "N/A"}
          </Badge>
          <Text fontSize="sm">
            Serial: {astLoan?.asset ? <AssetLink asset={astLoan.asset} withTooltip={true}/> : "N/A"}
          </Text>
          <Text fontSize="sm">
            User: <UserLink user={user} withTooltip={true}/>
          </Text>

          {accLoans?.length > 0 ? (
            <Box>
              {accLoans
                .filter((acc) => acc.unreturned > 0)
                .map((acc, index) => (
                  <Text fontSize="sm" key={`unreturned-${loanId}-${index}`}>❌ {acc.accType.accessoryName} x{acc.unreturned}</Text>
                ))}
              {accLoans
                .filter((acc) => acc.returned > 0)
                .map((acc, index) => (
                  <Text fontSize="sm" key={`returned-${loanId}-${index}`}>✅ {acc.accType.accessoryName} x{acc.returned}</Text>
                ))}
            </Box>
          ) : undefined}
        </VStack>
      )
    };
  };

  return <SelectableCards items={items} renderCard={renderCard} />;
}

export default ReminderCards;