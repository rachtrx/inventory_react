import { useEffect, useState } from "react"
import { useUI } from "../../context/UIProvider.js"
import eventService from "../../services/EventService.js";
import { 
  Box,
  Checkbox, 
  Menu, 
  MenuButton, 
  MenuList, 
  MenuItem, 
  IconButton, 
  useDisclosure, 
  Flex,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  useColorModeValue,
  VStack
} from "@chakra-ui/react";
import { ResponsiveText } from "../utils/ResponsiveText.js";
import { FiMoreVertical } from "react-icons/fi";
import { UpdateReturnDate } from "./updateReturnDate.js";
import { AssetLink, UserLink } from "../buttons/ItemLink.js";

export const Reminders = () => {
  const [reminders, setReminders] = useState([]);
  const [selectedLoanIds, setSelectedLoanIds] = useState([]);
  const { handleError, showToast } = useUI();
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Fetch reminders once the component mounts
  useEffect(() => {
    const fetchReminders = async () => {
      try {
        const response = await eventService.getReminders();
        console.log(response.data);
        setReminders(response?.data || []);
      } catch (err) {
        handleError(err);
      }
    };

    fetchReminders();
  }, [handleError]);

  // Handler for toggling "Select All" checkbox
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      // If checked, select all loan IDs
      const allLoanIds = reminders.map((reminder) => reminder.loanId);
      setSelectedLoanIds(allLoanIds);
    } else {
      // If unchecked, clear the selection
      setSelectedLoanIds([]);
    }
  };

  // Handler for toggling individual checkboxes
  const handleCheckboxChange = (loanId) => {
    if (selectedLoanIds.includes(loanId)) {
      setSelectedLoanIds(selectedLoanIds.filter((id) => id !== loanId));
    } else {
      setSelectedLoanIds([...selectedLoanIds, loanId]);
    }
  };

  // Handler for update return date menu option (opens modal)
  const handleUpdateReturn = () => {
    onOpen();
  };

  // Handler to submit the updated return date along with selected loan IDs
  const handleSubmit = async (values) => {
    try {
      console.log(values);
      const response = await eventService.extendReturnDate({loanIds: selectedLoanIds, ...values});
      showToast(response.data?.message, 'success', 1000);
      console.log("Return date updated to:", values.newReturnDate);
      onClose();
    } catch (err) {
      handleError(err);
    }
  };

  // Determine if all reminders are selected
  const allSelected =
    reminders.length > 0 && selectedLoanIds.length === reminders.length;

  return (
    <VStack>
      <Flex gap={1} alignSelf="end" p={1}>
        {/* Select All Checkbox */}
        <Checkbox onChange={handleSelectAll} isChecked={allSelected}>
          Select All
        </Checkbox>

        {/* Three Dots Menu */}
        <Menu>
          <MenuButton
            as={IconButton}
            icon={<FiMoreVertical />}
            variant="outline"
            aria-label="Actions"
            disabled={selectedLoanIds.length === 0}
          />
          <MenuList>
            <MenuItem onClick={handleUpdateReturn}>
              Update Return Date
            </MenuItem>
          </MenuList>
        </Menu>
      </Flex>

      {/* Reminder Items Table */}
      <Table size="sm" variant="simple">
        <Thead
          position="sticky"
          top="0"
          zIndex="1"
          bg={useColorModeValue('gray.100', 'gray.700')}
        >
          <Tr>
            {/* Column for checkboxes */}
            <Th></Th>
            <Th>Loan ID</Th>
            <Th>Asset Type</Th>
            <Th>Serial Number</Th>
            <Th>User</Th>
            <Th>Expected Return</Th>
            <Th>Accessories</Th>
          </Tr>
        </Thead>
        <Tbody>
          {reminders.map((reminder) => {
            const { loanId, user, astLoan, accLoans, expectedReturnDate } = reminder;
            const assetType = astLoan?.asset?.typeName || "N/A";

            return (
              <Tr 
                key={loanId} 
                _hover={{ bg: 'gray.100' }}
              >
                {/* Row Checkbox */}
                <Td>
                  <Checkbox
                    onChange={() => handleCheckboxChange(loanId)}
                    isChecked={selectedLoanIds.includes(loanId)}
                  />
                </Td>
                <Td>{loanId}</Td>                
                <Td>{assetType}</Td>
                <Td>{astLoan?.asset ? <AssetLink asset={astLoan.asset}/>: ""}</Td>
                <Td>
                  <UserLink user={user}/>
                </Td>
                <Td>{expectedReturnDate || "N/A"}</Td>
                <Td>
                  {accLoans.map((acc, index) => (
                    <Box key={`${loanId}-acc-${index}`} ml={4} mt={1}>
                      <ResponsiveText>
                        Accessory Name: {acc.accessoryName}
                      </ResponsiveText>
                      <ResponsiveText>
                        Unreturned: {acc.unreturned}
                      </ResponsiveText>
                      <ResponsiveText>
                        Returned: {acc.returned}
                      </ResponsiveText>
                    </Box>
                  ))}
                </Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>

      <UpdateReturnDate 
        isOpen={isOpen} 
        onClose={onClose} 
        handleSubmit={handleSubmit}
      />
    </VStack>
  );
};
