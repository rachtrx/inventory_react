import { 
  Box,
  Checkbox,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  useColorModeValue,
  VStack,
  Text,
  HStack,
  Button,
  Badge
} from "@chakra-ui/react";
import { AssetLink, UserLink } from "../buttons/ItemLink.js";
import { TriangleDownIcon, TriangleUpIcon } from '@chakra-ui/icons';
import { useItems } from "../../context/ItemsProvider.js";
import { ReturnButton } from "../buttons/actions/ReturnButton.js";
import { FormType } from "../../context/FormProvider.js";
import { SelectableTable } from "../utils/SelectableTable.js";

function ReminderTable () {
	const { handleSort, sortField, sortOrder } = useItems();

  return (
    <SelectableTable
      columns={[
        <Th>Serial Number</Th>,
        <Th>User</Th>,
        <Th onClick={() => handleSort("expectedReturnDate")} cursor="pointer">
          Expected Return {sortField === "expectedReturnDate" && (sortOrder === "asc" ? <TriangleUpIcon /> : <TriangleDownIcon />)}
        </Th>,
        <Th>Accessories</Th>,
        <Th></Th>
      ]}
      renderRow={(item) => {
        const { loanId, user, astLoan, accLoans, expectedReturnDate, daysLeft } = item;
        const bg = daysLeft < 0 ? `bgRed` : daysLeft === 0 ? 'bgYellow' : "bgGray";

        return {
          props: { bg, _hover: { bg: `${bg}Hover` } },
          cells: [
            <Td>{astLoan?.asset ? <AssetLink asset={astLoan.asset} withTooltip={true}/> : ""}</Td>,
            <Td>{user ? <UserLink user={user} withTooltip={true}/> : ""}</Td>,
            <Td><Badge fontSize="sm" colorScheme="gray">
              {expectedReturnDate || "N/A"}
            </Badge></Td>,
            <Td>
              {accLoans?.length ? (
                <Box>
                  {/* Unreturned Accessories */}
                  {accLoans
                    .filter(acc => acc.unreturned > 0)
                    .map((acc, index) => (
                      <Box key={`unreturned-${loanId}-${index}`} mb={1}>
                        <Text>❌ {acc.accType.accessoryName} x{acc.unreturned}</Text>
                      </Box>
                    ))}

                  {/* Returned Accessories */}
                  {accLoans
                    .filter(acc => acc.returned > 0)
                    .map((acc, index) => (
                      <Box key={`returned-${loanId}-${index}`} mb={1}>
                        <Text>✅ {acc.accType.accessoryName} x{acc.returned}</Text>
                      </Box>
                    ))}
                </Box>
              ) : undefined}
            </Td>,
            <Td>
              <ReturnButton 
                key={FormType.RETURN} 
                loanId={loanId}
              />
            </Td>
          ]
        };
      }}
    />
  );
};

export default ReminderTable;