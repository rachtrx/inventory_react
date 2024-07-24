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
import AddAsset from './forms/AddAsset';
import LoanAsset from './forms/LoanAsset';
import ReturnAsset from './forms/ReturnAsset';
import CondemnAsset from './forms/CondemnAsset';
import AddUser from './forms/AddUser';
import RemoveUser from './forms/RemoveUser';
import Toggle from './forms/utils/Toggle';
import { ResponsiveText } from './utils/ResponsiveText';
import { SectionDivider } from './forms/utils/SectionDivider';
import { buttonConfigs } from './buttons/constants';

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

    const { dispatch, formType, setIsExcel, isModalOpen, onModalOpen, onModalClose } = useFormModal();

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

    const checkFn = useCallback(() => {
        setIsExcel(true);
      }, [setIsExcel]); // Dependencies array includes setIsExcel
    
      const uncheckFn = useCallback(() => {
          setIsExcel(false);
      }, [setIsExcel]); // Dependencies array includes setIsExcel

    return (
        <Modal isOpen={isModalOpen} onClose={handleClose} size="xl" >
            <ModalOverlay />
            <ModalContent>
                <ModalCloseButton />
                <ModalHeader display="flex" alignItems="center" gap={4}>
                    <ResponsiveText size='lg'>{headerMap[formType]}</ResponsiveText>
                    <Divider orientation="vertical" height='20px'/>
                    <Toggle 
                        label="Use Excel"
                        check_fn={checkFn}
                        uncheck_fn={uncheckFn}
                    />
                </ModalHeader>
                {formMap[formType]}
            </ModalContent>
        </Modal>
    );
}