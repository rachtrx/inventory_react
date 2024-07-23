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
import { actionTypes, useFormModal, formTypes } from '../context/ModalProvider';
import AddAsset from './forms/AddAsset';
import LoanAsset from './forms/LoanAsset';
import ReturnAsset from './forms/ReturnAsset';
import CondemnAsset from './forms/CondemnAsset';
import AddUser from './forms/AddUser';
import RemoveUser from './forms/RemoveUser';

const formMap = {
    [formTypes.ADD_ASSET]: <AddAsset/>,
    [formTypes.LOAN]: <LoanAsset/>,
    [formTypes.RETURN]: <ReturnAsset/>,
    [formTypes.DEL_ASSET]: <CondemnAsset/>,
    [formTypes.ADD_USER]: <AddUser/>,
    [formTypes.DEL_USER]: <RemoveUser/>,
}

const headerMap = {
    [formTypes.ADD_ASSET]: "Add Asset",
    [formTypes.LOAN]: 'Loan Asset',
    [formTypes.RETURN]: 'Return Asset',
    [formTypes.DEL_ASSET]: "Condemn Asset",
    [formTypes.ADD_USER]: "Add User",
    [formTypes.DEL_USER]: "Remove User",
}

export default function FormModal() { 

    const { dispatch, formType, initialValues, onSubmit, isModalOpen, onModalOpen, onModalClose } = useFormModal();

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
                <ModalCloseButton />
                <ModalHeader>{headerMap[formType]}</ModalHeader>
                {formMap[formType]}
            </ModalContent>
        </Modal>
    );
}