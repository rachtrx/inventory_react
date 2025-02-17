import { Box, HStack } from "@chakra-ui/react"
import CheckBadge from "../../badges/CheckBadge"
import WarningBadge from "../../badges/WarningBadge"

import {Table, Thead, Tbody, Tr, Th, Td } from "@chakra-ui/react";
import AssetLoanEvent from "../AssetLoanEvent";
import UserLoanEvent from "../UserLoanEvent";
import AccLoanEvent from "../AccLoanEvent";
import DeleteEvent from "../DeleteEvent";
import AddEvent from "../AddEvent";
import AssetReserveEvent from "../AssetReserveEvent";

const withEventBox = (Component) => {
    return (props) => {
        return (
            <Box position="relative">
                {/* Event Content */}
                <Box
                    p={2}
                    bg="gray.50"
                    borderRadius="lg"
                    boxShadow="md"
                    border="1px solid"
                    borderColor="gray.200"
                    w="100%"
                >
                    <Component {...props} /> {/* ✅ Render the Component properly */}
                </Box>
            </Box>
        );
    };
};


export const DeleteEventBox = withEventBox(DeleteEvent)
export const AddEventBox = withEventBox(AddEvent)
export const AssetLoanEventBox = withEventBox(AssetLoanEvent)
export const UserLoanEventBox = withEventBox(UserLoanEvent)
export const AccLoanEventBox = withEventBox(AccLoanEvent)

// export const AccReserveEventBox = withEventBox(AccReserveEvent)
export const AssetReserveEventBox = withEventBox(AssetReserveEvent)