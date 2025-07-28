import * as Yup from 'yup';
import { Button, Popover, PopoverContent, PopoverTrigger, Text, useDisclosure } from "@chakra-ui/react";
import { useItems } from "../../../context/ItemsProvider";
import { useUI } from "../../../context/UIProvider";
import { useForm } from "../../../context/FormProvider";
import { Form, Formik } from "formik";
import eventService from '../../../services/EventService';
import RemarksFormControl from '../../forms/utils/RemarksFormControl';

export const AddRemarks = () => {

    const { isOpen, onOpen, onClose } = useDisclosure();
    const { handleError, showToast } = useUI();
    const { selectedItems } = useItems();
    const { triggerRefresh } = useForm();

    // Handler to submit the updated return date along with selected loan IDs
    const handleSubmit = async (values, actions) => {
			try {
				console.log(values);
				const response = await eventService.addRemark(selectedItems.map(item => item.eventId), values.remark);
				showToast(response.data?.message, 'success', 1000);
				console.log("Return date updated to:", values.newReturnDate);
				actions.resetForm();
				triggerRefresh();
				onClose();
			} catch (err) {
				handleError(err);
			}
    };

    const validationSchema = Yup.object({
			remark: Yup.string()
				.required("Remarks is required"),
    });

    return (
			<Popover isOpen={isOpen} onClose={onClose} placement="right" closeOnBlur={true}>
				<PopoverTrigger>
					<Button
						variant="outline"
						disabled={selectedItems.length === 0}
						onClick={onOpen}
					>
						Add Remarks {selectedItems.length ? `for ${selectedItems.length} item(s)` : ""} 
					</Button>
				</PopoverTrigger>

				<PopoverContent p={4} boxShadow="lg">
					<Formik
						initialValues={{ remark: "" }}
						onSubmit={async (values, actions) => {
							await handleSubmit(values, actions);
							actions.setSubmitting(false);
						}}
						validationSchema={validationSchema}
					>
						<Form>
							<Text mb={2} fontSize="lg">Add Remark</Text>

							<RemarksFormControl name="remark" isCollapsible={false} />

							<Button type="submit" mt={3} colorScheme="blue">
								Submit
							</Button>
						</Form>
					</Formik>
				</PopoverContent>
			</Popover>
    )
}