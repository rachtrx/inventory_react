import * as Yup from 'yup';
import { 
  Button, 
  Modal, 
  ModalOverlay, 
  ModalContent, 
  ModalHeader, 
  ModalCloseButton, 
  ModalBody, 
  ModalFooter, 
} from "@chakra-ui/react";
import { Form, Formik } from 'formik';
import DateInputControl from '../../forms/utils/DateInputControl';

export const UpdateReturnDate = ({ isOpen, onClose, handleSubmit }) => {

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Yup schema defined within the component
    const validationSchema = Yup.object({
        newReturnDate: Yup.date()
        .min(today, "Return date cannot be before today")
        .required("New Return Date is required"),
    });
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Update Return Date</ModalHeader>
                <ModalCloseButton />
                <Formik
                    initialValues={{
                        newReturnDate: ""
                    }}
                    onSubmit={handleSubmit}
                    validationSchema={validationSchema}
                >
                    <Form>
                        <ModalBody>
                            {/* DatePicker component from your chakra date picker */}
                            <DateInputControl
                                placeholder="New Return Date" 
                                name={`newReturnDate`} 
                            />
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="ghost" mr={3} onClick={onClose}>
                                Cancel
                            </Button>
                            <Button colorScheme="blue" type='submit'>
                                Update
                            </Button>
                        </ModalFooter>
                    </Form>
                </Formik>
            </ModalContent>
        </Modal>
    )
}