import * as Yup from 'yup';
import { Button, Popover, useDisclosure } from "@chakra-ui/react";
import { useItems } from "../../../context/ItemsProvider";
import reminderService from "../../../services/ReminderService";
import { useUI } from "../../../context/UIProvider";
import { useForm } from "../../../context/FormProvider";
import { CreatableSingleSelectFormControl } from "../../forms/utils/SelectFormControl";
import { Formik } from "formik";
import { useAssetTags } from '../../forms/asset/tags/AssetTagsProvider';
import { useEffect, useState } from 'react';

export const AddAssetTags = () => {

    const { isOpen, onOpen, onClose } = useDisclosure();
    const { handleError, showToast } = useUI();
    const { selectedItems } = useItems();
    const { formType, setFormType, initialValues, triggerRefresh, reinitializeForm } = useForm();
    const { tagOptions } = useAssetTags();
    const [ newTagOptions, setNewTagOptions ] = useState(tagOptions);
    const [ isDisabled, setIsDisabled ] = useState(true)
    
    useEffect(() => {
        if (!selectedItems?.length) setNewTagOptions(tagOptions);

        const tagIdsSet = new Set();

        for (const event of selectedItems) {
            // if (event.)
        }
    }, [selectedItems])


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

    const validationSchema = Yup.object({
        tagId: Yup.string()
            .required("Asset Tag is required"),
    });

    return (
        <>
            <Button
                variant="outline"
                disabled={selectedItems.length === 0}
                onClick={handleUpdateReturn}
            >
                Update Return Date
            </Button>
            <Popover
                isOpen={isOpen}
                onClose={onClose} 
                handleSubmit={handleSubmit}
            />
            <Formik
                initialValues={{
                    tagId: "",
                    assetIds: ""
                }}
                onSubmit={handleSubmit}
                validationSchema={validationSchema}
            >
            {/* <CreatableSingleSelectFormControl

            /> */}
            </Formik>
        </>
    )
}