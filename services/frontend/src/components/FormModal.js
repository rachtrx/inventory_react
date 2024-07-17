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
import { useModal } from '../context/ModalProvider';
import CondemnAsset from '../pages/components/forms/main/CondemnAsset';
import AddAsset from '../pages/components/forms/main/AddAsset';
import LoanAsset from '../pages/components/forms/main/LoanAsset';
import ReturnAsset from '../pages/components/forms/main/ReturnAsset';

const formMap = {
    'addAsset': <AddAsset/>,
    'loanAsset': <LoanAsset/>,
    'returnAsset': <ReturnAsset/>,
    'condemnAsset': <CondemnAsset/>,
}

const headerMap = {
    'addAsset': "Add Asset",
    // 'loanAsset':.
    // 'returnAsset': ,
    'condemnAsset': "Condemn Asset",
}

export default function FormModal() { 

    const { isOpen: isModalOpen, onOpen: onModalOpen, onClose: onModalClose } = useDisclosure();
    const { formType, setFormType, initialValues, setInitialValues, onSubmit, setOnSubmit } = useModal();

    useEffect(() => {
        if (formType) {
            onModalOpen();
        } else {
            onModalClose();
        }
    }, [formType, onModalOpen, onModalClose]);

    const handleClose = () => {
        setFormType(null);
        setInitialValues({});
        setOnSubmit(() => null);
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
    
                        <ModalBody style={{ display: "grid", height: "100%", gridTemplateRows: "repeat(auto-fill, 1fr)" }}>
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