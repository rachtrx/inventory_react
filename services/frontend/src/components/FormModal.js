import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
    Button,
    useDisclosure,
    Box,
    Divider
} from '@chakra-ui/react';
import { useCallback, useEffect } from 'react';
import { Form, Formik } from 'formik';
import { actionTypes, useFormModal, formTypes } from '../context/ModalProvider';
import CondemnAsset from './forms/CondemnAsset';
import AddUser from './forms/AddUser';
import RemoveUser from './forms/RemoveUser';
import Toggle from './forms/utils/Toggle';
import { ResponsiveText } from './utils/ResponsiveText';
import AddPeripheral from './forms/AddPeripheral';
import Reserve from './forms/Reserve';
import { LoansProvider } from './forms/loan/LoansProvider';
import { ReturnsProvider } from './forms/return/ReturnsProvider';
import { AddAssetsProvider } from './forms/addAsset/AddAssetsProvider';

const formMap = {
    [formTypes.ADD_ASSET]: <AddAssetsProvider/>,
    [formTypes.LOAN]: <LoansProvider/>,
    [formTypes.RETURN]: <ReturnsProvider/>,
    [formTypes.DEL_ASSET]: <CondemnAsset/>,
    [formTypes.ADD_USER]: <AddUser/>,
    [formTypes.DEL_USER]: <RemoveUser/>,
    [formTypes.ADD_PERIPHERAL]: <AddPeripheral/>,
    [formTypes.RESERVE]: <Reserve/>,
}

const headerMap = {
    [formTypes.ADD_ASSET]: "Add Asset",
    [formTypes.LOAN]: 'Loan',
    [formTypes.RETURN]: 'Return',
    [formTypes.DEL_ASSET]: "Condemn Asset",
    [formTypes.ADD_USER]: "Add User",
    [formTypes.DEL_USER]: "Remove User",
    [formTypes.ADD_PERIPHERAL]: "Add Peripheral",
    [formTypes.RESERVE]: "Reserve Items",
}

export default function FormModal() { 

    const { setFormType, formType, isModalOpen, onModalOpen, onModalClose } = useFormModal();

    useEffect(() => {
        if (formType) {
            onModalOpen();
        } else {
            onModalClose();
        }
    }, [formType, onModalOpen, onModalClose]);

    return (
        <Modal 
            isOpen={isModalOpen} 
            onClose={() => setFormType(null)} 
            scrollBehavior='inside' 
            size="xl" 
        >
            <ModalOverlay />
            <ModalContent overflowY='scroll'>
                <ModalCloseButton />
                <ModalHeader display="flex" alignItems="center" gap={4}>
                    <ResponsiveText size='lg'>{headerMap[formType]}</ResponsiveText>
                    <Divider orientation="vertical" height='20px'/>
                </ModalHeader>
                {formMap[formType]}
            </ModalContent>
        </Modal>
    );
}