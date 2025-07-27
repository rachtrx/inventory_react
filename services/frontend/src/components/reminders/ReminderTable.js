import { useEffect, useState } from "react"
import { useUI } from "../../context/UIProvider.js"
import reminderService from "../../services/ReminderService.js";
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
  VStack,
  Text
} from "@chakra-ui/react";
import { FiMoreVertical } from "react-icons/fi";
import { UpdateReturnDate } from "../stats/updateReturnDate.js";
import { AssetLink, UserLink } from "../buttons/ItemLink.js";
import { TriangleDownIcon, TriangleUpIcon } from '@chakra-ui/icons';
import { ACTION_COLORS } from '../buttons/constants'; 
import { useItems } from "../../context/ItemsProvider.js";
import { ReturnButton } from "../buttons/actions/ReturnButton.js";
import { FormType } from "../../context/ModalProvider.js";

function ReminderTable ({ items }) {
  const [selectedLoanIds, setSelectedLoanIds] = useState([]);
  const { handleError, showToast } = useUI();
  const { isOpen, onOpen, onClose } = useDisclosure();

	const { handleSort, sortField, sortOrder } = useItems();

  // Handler for toggling "Select All" checkbox
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      // If checked, select all loan IDs
      const allLoanIds = items.map((reminder) => reminder.loanId);
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
      const response = await reminderService.extendReturnDate({loanIds: selectedLoanIds, ...values});
      showToast(response.data?.message, 'success', 1000);
      console.log("Return date updated to:", values.newReturnDate);
      onClose();
    } catch (err) {
      handleError(err);
    }
  };

  // Determine if all reminders are selected
  const allSelected =
		items.length > 0 && selectedLoanIds.length === items.length;

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
						<Th>
							<Checkbox onChange={handleSelectAll} isChecked={allSelected} />
						</Th>
						<Th>Loan ID</Th>
						<Th>Asset Type</Th>
						<Th>Serial Number</Th>
						<Th>User</Th>
						<Th onClick={() => handleSort("expectedReturnDate")} cursor="pointer">Expected Return {sortField === "expectedReturnDate" && (sortOrder === "asc" ? <TriangleUpIcon /> : <TriangleDownIcon />)}</Th>
						<Th>Accessories</Th>
						<Th></Th>
					</Tr>
				</Thead>
				<Tbody>
					{items.map((reminder) => {
						const { loanId, user, astLoan, accLoans, expectedReturnDate, overdue } = reminder;
						const assetType = astLoan?.asset?.typeName || "N/A";
						const rowColor = overdue ? `${overdue}.100` : "transparent";

						return (
							<Tr
								key={loanId}
								bg={`${rowColor}`} // softly colour background
								_hover={{ bg: overdue ? `${overdue}.200` : 'gray.100' }}
							>
								<Td>
									<Checkbox
										onChange={() => handleCheckboxChange(loanId)}
										isChecked={selectedLoanIds.includes(loanId)}
									/>
								</Td>
								<Td>{loanId}</Td>
								<Td>{assetType}</Td>
								<Td>{astLoan?.asset ? <AssetLink asset={astLoan.asset}/> : ""}</Td>
								<Td>{user ? <UserLink user={user}/> : ""}</Td>
								<Td>{expectedReturnDate || "N/A"}</Td>
								<Td>
									{accLoans?.length && (
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
									)}
								</Td>
								<Td>
									<ReturnButton 
										key={FormType.RETURN} 
										loanId={loanId}
									/>
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

export default ReminderTable;