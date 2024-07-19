import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
    Button,
    useDisclosure
} from '@chakra-ui/react';
import { useEffect } from 'react';
import { Form, Formik } from 'formik';
import { actionTypes, useModal } from '../context/ModalProvider';
import AddAsset from './forms/AddAsset';
import LoanAsset from './forms/LoanAsset';
import ReturnAsset from './forms/ReturnAsset';
import CondemnAsset from './forms/CondemnAsset';

const formMap = {
    'addAsset': <AddAsset/>,
    'loanAsset': <LoanAsset/>,
    'returnAsset': <ReturnAsset/>,
    'condemnAsset': <CondemnAsset/>,
}

const headerMap = {
    'addAsset': "Add Asset",
    'loanAsset': 'Loan Asset',
    'returnAsset': 'Return Asset',
    'condemnAsset': "Condemn Asset",
}

export default function FormModal() { 

    const { isOpen: isModalOpen, onOpen: onModalOpen, onClose: onModalClose } = useDisclosure();
    const { dispatch, formType, initialValues, onSubmit } = useModal();

    useEffect(() => {
        if (formType) {
            onModalOpen();
        } else {
            onModalClose();
        }
    }, [formType, onModalOpen, onModalClose]);

    const handleClose = () => {
        dispatch({ type: actionTypes.SET_FORM_TYPE, payload: null });
    };

    return (
        <Modal isOpen={isModalOpen} onClose={handleClose} size="xl">
            <ModalOverlay />
            <ModalContent>
                <Formik
                    initialValues={initialValues}
                    onSubmit={onSubmit}
                    enableReinitialize={true}
                >
                    <Form style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                        <ModalCloseButton />
                        <ModalHeader>{headerMap[formType]}</ModalHeader>
    
                        <ModalBody style={{ overflowY: "auto", maxHeight: "70vh" }}>
                            {formMap[formType]}
                        </ModalBody>
    
                        <ModalFooter>
                            <Button variant='outline' mr={3} onClick={onModalClose}>
                                Cancel
                            </Button>
                            <Button colorScheme='blue' type="submit">Submit</Button>
                        </ModalFooter>
                    </Form>
                </Formik>
            </ModalContent>
        </Modal>
    );
}