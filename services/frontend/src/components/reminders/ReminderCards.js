import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Flex,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  Tooltip,
  Heading,
  Box,
  Checkbox,
  VStack,
  Button,
} from "@chakra-ui/react";
import { FiMoreVertical } from "react-icons/fi";
import { useDisclosure } from "@chakra-ui/react";
import { useUI } from "../../context/UIProvider.js";
import reminderService from "../../services/ReminderService.js";
import { UpdateReturnDate } from "../stats/updateReturnDate.js";
import { AssetLink, UserLink } from "../buttons/ItemLink.js";
import Cards from "../utils/Cards.js";

function ReminderCards({ items }) {
  const [selectedLoanIds, setSelectedLoanIds] = useState([]);
  const { handleError, showToast } = useUI();
  const { isOpen, onOpen, onClose } = useDisclosure();

	const today = new Date(new Date().toLocaleString("en-SG", { timeZone: "Asia/Singapore" }));
	today.setHours(0, 0, 0, 0);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allLoanIds = items.map((reminder) => reminder.loanId);
      setSelectedLoanIds(allLoanIds);
    } else {
      setSelectedLoanIds([]);
    }
  };

  const handleCheckboxChange = (loanId) => {
    if (selectedLoanIds.includes(loanId)) {
      setSelectedLoanIds(selectedLoanIds.filter((id) => id !== loanId));
    } else {
      setSelectedLoanIds([...selectedLoanIds, loanId]);
    }
  };

  const handleUpdateReturn = () => {
    onOpen();
  };

  const handleSubmit = async (values) => {
    try {
      const response = await reminderService.extendReturnDate({ loanIds: selectedLoanIds, ...values });
      showToast(response.data?.message, 'success', 1000);
      onClose();
    } catch (err) {
      handleError(err);
    }
  };

  const allSelected = items.length > 0 && selectedLoanIds.length === items.length;

  return (
    <VStack w="full" align="stretch" spacing={4}>
      {/* Toolbar */}
      <Flex justify="space-between" align="center" px={2}>
        <Checkbox isChecked={allSelected} onChange={handleSelectAll}>
          Select All
        </Checkbox>
        <Button
          variant="outline"
          aria-label="Actions"
          disabled={selectedLoanIds.length === 0}
          onClick={handleUpdateReturn}
        >
          Update Return Date
        </Button>
      </Flex>

      {/* Reminder Cards */}
			<Cards>
				{items.map((reminder) => {
					const { loanId, user, astLoan, accLoans, expectedReturnDate, overdue } = reminder;
					const assetType = astLoan?.asset?.typeName || "N/A";
					const isSelected = selectedLoanIds.includes(loanId);

					return (
						<Card
							key={loanId}
							position="relative"
							bg={overdue ? `${overdue}` : "transparent"}
							_hover={{ bg: overdue ? `${overdue}Hover` : 'gray' }}
							role="group"
						>
							{/* Hover-only Checkbox */}

							<CardHeader pb={0}>
                <Checkbox
                  isChecked={isSelected}
                  onChange={() => handleCheckboxChange(loanId)}
                  position="absolute"
                  top="1rem"
                  left="1rem"
                  opacity={isSelected ? 1 : 0}
                  _groupHover={{ opacity: 1 }}
                  transition="opacity 0.2s"
                />
								<Flex justify="space-between" align="center">
									{/* <Heading size="sm">Loan ID: {loanId}</Heading> */}
									<Text fontSize="sm" color="gray.500">
										Expected Return: {expectedReturnDate || "N/A"}
									</Text>
								</Flex>
							</CardHeader>

							<CardBody pt={2}>
								<VStack align="start" spacing={1}>
									<Text fontWeight="medium">Asset Type: {assetType}</Text>
									<Text>
										Serial: {astLoan?.asset ? <AssetLink asset={astLoan.asset} /> : "N/A"}
									</Text>
									<Text>
										User: <UserLink user={user} />
									</Text>

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
								</VStack>
							</CardBody>
						</Card>
					);
				})}
			</Cards>

      <UpdateReturnDate
        isOpen={isOpen}
        onClose={onClose}
        handleSubmit={handleSubmit}
      />
    </VStack>
  );
};

export default ReminderCards;