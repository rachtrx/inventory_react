import { Button, useDisclosure } from "@chakra-ui/react";
import { useItems } from "../../../context/ItemsProvider";
import reminderService from "../../../services/ReminderService";
import { useUI } from "../../../context/UIProvider";
import { UpdateReturnDate } from "./UpdateReturnDate";
import { FormType, useForm } from "../../../context/FormProvider";
import { BulkActionButton } from "../../buttons/BulkActionButton";
import { useFormModal } from "../../forms/control/FormModalProvider";

export const ReturnAll = () => {

    const { onOpen } = useFormModal();
    const { setInitialValues, setFormType } = useForm();
    const { selectedItems } = useItems();

    // Handler to submit the updated return date along with selected loan IDs
    const handleClick = () => {
        setFormType(FormType.RETURN);
        setInitialValues(selectedItems.map(item => item.loanId))
        onOpen();
    };

    return (
        <>
            <BulkActionButton
                disabled={selectedItems.length === 0}
                onClick={handleClick}
            >
                Return Items
            </BulkActionButton>
        </>
    )
}