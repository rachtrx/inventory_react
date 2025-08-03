import { Button, useDisclosure } from "@chakra-ui/react";
import { useItems } from "../../../context/ItemsProvider";
import reminderService from "../../../services/ReminderService";
import { useUI } from "../../../context/UIProvider";
import { UpdateReturnDate } from "./UpdateReturnDate";
import { useForm } from "../../../context/FormProvider";
import { BulkActionButton } from "../../buttons/BulkActionButton";

export const UpdateExpectedReturn = () => {

    const { isOpen, onOpen, onClose } = useDisclosure();
    const { handleError, showToast } = useUI();
    const { selectedItems } = useItems();
    const { triggerRefresh } = useForm();

    const handleUpdateReturn = () => {
        onOpen();
    };

    // Handler to submit the updated return date along with selected loan IDs
    const handleSubmit = async (values) => {
        try {
            console.log(values);
            const response = await reminderService.extendReturnDate({loanIds: selectedItems.map(item => item.loanId), ...values});
            showToast(response.data?.message, 'success', 1000);
            console.log("Return date updated to:", values.newReturnDate);
            triggerRefresh();
            onClose();
        } catch (err) {
            handleError(err);
        }
    };

    return (
        <>
            <BulkActionButton
                disabled={selectedItems.length === 0}
                onClick={handleUpdateReturn}
            >
                Update Return Date
            </BulkActionButton>
            <UpdateReturnDate
                isOpen={isOpen}
                onClose={onClose} 
                handleSubmit={handleSubmit}
            />
        </>
    )
}